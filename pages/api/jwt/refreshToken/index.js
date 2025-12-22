import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const { user } = session;

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res
      .status(401)
      .json({ message: "Unauthorized access to the requested resource" });
    return;
  }

  const refreshToken = authHeader.split(" ")[1];

  if (!refreshToken) {
    res
      .status(401)
      .json({ message: "Unauthorized access to the requested resource" });
    return;
  }

  const allRefreshTokens = await prisma.CustomJWT.findMany({
    where: {
      userId: user.id,
    },
    select: {
      jwtRefreshToken: true,
    },
  });

  if (allRefreshTokens[0].jwtRefreshToken !== refreshToken) {
    res
      .status(403)
      .json({ message: "Access to the requested resource is forbidden" });
    return;
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, (error) => {
    if (error)
      res
        .status(403)
        .json({ message: "Access to the requested resource is forbidden" });
    const newAccessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: `${60 * 60 * 24 * 7}s`,
    });

    res.status(200).json({ accessToken: newAccessToken });
  });
}
