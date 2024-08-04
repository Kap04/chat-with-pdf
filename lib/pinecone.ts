import { Pinecone } from "@pinecone-database/pinecone";


if(!process.env.PINCONE_API_KEY){
    throw new Error("PINCONE_API_KEY is not set");
}

const pineconeClient = new Pinecone({
    apiKey:process.env.PINCONE_API_KEY
}) 

export default pineconeClient