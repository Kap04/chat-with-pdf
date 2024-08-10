import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone"
import { adminDb } from "../firebaseAdmin"
import { auth } from "@clerk/nextjs/server"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {ChatPromptTemplate} from "@langchain/core/prompts"
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
// Initialize the model
const model = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "embedding-001",
});

const chatModel = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "gemini-1.5-flash", // Use the appropriate model name
});

// You can keep this function if you need to test the embeddings
async function testEmbeddings() {
    // Embed a single query
    const res = await model.embedQuery(
        "What would be a good company name for a company that makes colorful socks?"
    );
    console.log({ res });

    // Embed multiple documents
    const documentRes = await model.embedDocuments(["Hello world", "Bye bye"]);
    console.log({ documentRes });
}

// Optionally run the test function
// testEmbeddings();

export const indexName = "pdfembeddings"

async function fetchMessagesFromDb(docId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not found");
    }
    console.log("----Fetching chat history from the firestore database... ----");
    const LIMIT = 6
    //get the last 6 messages from the chat history
    const chats = await adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(docId)
        .collection("chat")
        .orderBy("createdAt", "desc")
        // .limit(LIMIT)
        .get()

    const chatHistory = chats.docs.map((doc) => 
         doc.data().role === "human"
            ? new HumanMessage(doc.data().message)
            : new AIMessage(doc.data().message)
    )
    console.log(`---fetched last ${chatHistory.length} messages fetched successfully ---`)
    console.log(chatHistory.map((msg) => msg.content.toString()));
    return chatHistory
}

export async function generateDocs(docId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("user not found");
    }

    console.log("--- fetching the download URL from firebase... --- ")
    const firebaseRef = await adminDb.collection("users").doc(userId).collection("files").doc(docId).get()

    const downloadUrl = firebaseRef.data()?.downloadUrl

    if (!downloadUrl) {
        throw new Error("--- Download URL not found ---");
    }
    console.log(`--- download URL fetched successfully: ${downloadUrl}  ---`)

    //Fetching the PDF from the specified URL
    const response = await fetch(downloadUrl)

    const data = await response.blob();

    console.log("--- loading PDF document ---")
    const loader = new PDFLoader(data);
    const docs = await loader.load();

    //Splitting the document
    console.log("--- splitting the document into smaller parts ---- ")
    const splitter = new RecursiveCharacterTextSplitter();

    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`---splitting into ${splitDocs.length} parts ---`)

    return splitDocs;
}

async function nameSpaceExists(index: Index<RecordMetadata>, namespace: string) {
    if (namespace === null) throw new Error("No namespace value provided.");
    const { namespaces } = await index.describeIndexStats();
    return namespaces?.[namespace] !== undefined
}


export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }
    let pineconeVectorStore;

    console.log(" --- Generating embeddings... --- ");

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: "embedding-001",
    });

    const index = await pineconeClient.index(indexName)
    const nameSpaceAlreadyExists = await nameSpaceExists(index, docId);

    if (nameSpaceAlreadyExists) {
        console.log(`--- Namespace ${docId} already exists, reusing existing embeddings... ---`)
        pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: index,
            namespace: docId
        })
        return pineconeVectorStore
    }
    else {
        // if the namespace does not exist , download the pdf from firestore via the stored download url & generate the embeddings and store them in the Pinecone vector store
        const splitDocs = await generateDocs(docId)

        console.log(`--- storing the embeddings in namespace ${docId} in the ${indexName} Pinecone vector store... ---`);

        pineconeVectorStore = await PineconeStore.fromDocuments(
            splitDocs,
            embeddings,
            {
                pineconeIndex: index,
                namespace: docId,
            }
        )
        return pineconeVectorStore
    }


}

const generatelangchainCompletion = async (docId: string, question: string) => {
    let pineconeVectorStore;

    pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);
    if (!pineconeVectorStore) {
        throw new Error("Pinecone Vectore store not found");
    }

    //create a retriever to search through the vector store
    console.log("--- Creating a retriever ...----");
    const retriever = pineconeVectorStore.asRetriever();

    const chatHistory = await fetchMessagesFromDb(docId);

    //define a prompt template for generating search queries based on conversation history
    console.log("---Defining a prompt template...---");
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
        ...chatHistory , 
        ["user", "{input}"],
        [
            "user",
            "Given the above conversation, generate a search query to look up in order to get information relevant to the  conversation",
        ]
    ])

    console.log("---Creating a history-aware retriever chain...---");

    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm : chatModel,
        retriever,
        rephrasePrompt:historyAwarePrompt
    })

    //prompt template for answering questions ased on retrieved context

    console.log("---Defining a prompt template for answering questions...---")
    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "Answer the user's questions based on the below context:\n\n{context}"
        ],

        ...chatHistory,

        ["user","{input}"],
    ])

    console.log("---Creating a document combining chain...---");
    const historyAwareCombinedocsChain = await createStuffDocumentsChain({
        llm:chatModel,
        prompt:historyAwareRetrievalPrompt,
    })

    console.log("---Creating the main retrieval chain...---");

    const conversationalRetrievalChain = await createRetrievalChain({
        retriever: historyAwareRetrieverChain,
        combineDocsChain:historyAwareCombinedocsChain,
    })

    console.log("---Running the chain with a sample conversation...---");
    const reply = await conversationalRetrievalChain.invoke({
        chat_history:chatHistory,
        input:question
    })
    console.log(reply.answer)
    return reply.answer
}

export { model , generatelangchainCompletion}