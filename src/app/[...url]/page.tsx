import { ChatWrapper } from "../../components/ChatWrappper";
import { ragChat } from "@/lib/rag-chat";
import { redis } from "@/lib/redis";

interface PageProps {
  params: Promise<{
    url: string | string[] | undefined;
  }>;
}

const reconstructedUrl = ({ urls }: { urls: string[] }): string =>
  urls?.map((component) => decodeURIComponent(component))?.join("/");

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const reConstructedUrl = reconstructedUrl({
    urls: resolvedParams.url as string[],
  });

  const isAlreadyindexed = await redis.sismember(
    "indexed-urls",
    reConstructedUrl
  ); // Chercks if alr xxists in redis

  if (!isAlreadyindexed) {
    await ragChat.context.add({
      type: "html",
      source: reConstructedUrl,
      config: { chunkOverlap: 50, chunkSize: 200 },
    });

    redis.sadd("indexed-urls", reConstructedUrl); // sets in redis
  }

  return <ChatWrapper sessionId="mock" />;
};

export default Page;
