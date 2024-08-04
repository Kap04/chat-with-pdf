import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents"
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval"
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever"
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { Index, RecordMetadata } from "@pinecone-database/pinecone"
import { adminDb } from "../firebaseAdmin"
import { auth } from "@clerk/nextjs/server"
import { split } from "postcss/lib/list";

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o"
})

export const indexName = "pdf-embeds"

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

    const embeddings = new OpenAIEmbeddings();

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

        pineconeVectorStore =  await PineconeStore.fromDocuments(
            splitDocs , 
            embeddings,
            {
                pineconeIndex:index,
                namespace:docId,
            }
        )
        return pineconeVectorStore
    }


}