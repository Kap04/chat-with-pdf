'use server'

import { auth } from "@clerk/nextjs/server"
import {  generateEmbeddingsInPineconeVectorStore } from "../lib/langchain"
import { revalidatePath } from "next/cache";


export async function generateEmbeddings(docId: string) {
    auth().protect;

    //turn a PDF into embeddings....

    await generateEmbeddingsInPineconeVectorStore(docId)

    revalidatePath('/dashboard');
    return { completed: true };
}