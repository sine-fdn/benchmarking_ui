import { PrismaClient } from "@prisma/client";

const CLIENT = new PrismaClient();

export default function prismaClient() {
  return CLIENT;
}
