import jwt from "jsonwebtoken";
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

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: `${60 * 60 * 24 * 7}s`,
  });
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET_KEY);

  await prisma.CustomJWT.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.CustomJWT.create({
    data: {
      userId: user.id,
      jwtRefreshToken: refreshToken,
    },
  });

  res.status(200).json({ accessToken, refreshToken });
}
