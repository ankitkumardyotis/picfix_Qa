import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function GET(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const { user } = session;

  if (!session) {
    res
      .status(401)
      .json({ message: "Unauthorized access to the requested resource" });
    return;
  }

  await prisma.CustomJWT.deleteMany({
    where: {
      userId: user.id,
    },
  });

  res.status(200).json({ message: "Logged out successfully" });
}
