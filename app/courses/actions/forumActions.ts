"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createForumPost(courseId: string, authorId: string, content: string) {
  try {
    if (!content.trim()) throw new Error("Pesan diskusi tidak boleh kosong.");

    const post = await prisma.forumPost.create({
      data: {
        courseId,
        authorId,
        content
      }
    });

    revalidatePath(`/courses/${courseId}`);
    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteForumPost(postId: string, courseId: string) {
  try {
    await prisma.forumPost.delete({ where: { id: postId } });
    revalidatePath(`/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
