interface UsrbgApiReturn {
  endpoint: string;
  bucket: string;
  prefix: string;
  users: Record<string, string>;
}

let data = null as UsrbgApiReturn | null;

function userHasBackground(userId: string) {
  return !!data?.users[userId];
}

function getImageUrl(userId: string): string | null {
  if (!userHasBackground(userId)) return null;

  // We can assert that data exists because userHasBackground returned true
  const { endpoint, bucket, prefix, users: { [userId]: etag } } = data!;
  return `${endpoint}/${bucket}/${prefix}${userId}?${etag}`;
}

export function patchBannerUrl({ displayProfile }: any) {
  if (displayProfile?.banner && moonlight.getConfigOption<boolean>("usrbg", "nitroFirst")) return;
  if (userHasBackground(displayProfile?.userId)) return getImageUrl(displayProfile?.userId);
}

async function getData() {
  const res = await fetch(moonlight.getConfigOption<string>("usrbg", "baseUrl")!);
  if (res.ok) {
    data = await res.json();
  }
}

getData();