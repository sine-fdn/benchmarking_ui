import { PrismaClient } from "@prisma/client";

let clientSaved: PrismaClient | undefined = undefined;

export default function prismaConnection() {
  if (!clientSaved) {
    clientSaved = new PrismaClient();
  }
  return clientSaved;
}
