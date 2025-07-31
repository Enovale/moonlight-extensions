let data = {
    avatars: {} as Record<string, string>,
};

type AvatarHookFunction = (original: any) => (user: User, animated: boolean, size: number) => string;

export const getAvatarHook: AvatarHookFunction = (original) => (user, animated, size) => {
    if (moonlight.getConfigOption<boolean>("userpfp", "preferNitro") && user.avatar?.startsWith("a_")) return original(user, animated, size);

    return data.avatars[user.id] ?? original(user, animated, size);
}

async function getData() {
    await fetch(moonlight.getConfigOption<string>("userpfp", "apiUrl")!)
        .then(async res => {
            if (res.ok) this.data = data = await res.json();
        })
        .catch(() => null);
}

getData();