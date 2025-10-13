let data = {
    avatars: {} as Record<string, string>,
};

type AvatarHookFunction = (original: any) => (user: User, animated: boolean, size: number) => string;

export const getAvatarHook: AvatarHookFunction = (original) => (user, animated, size) => {
    if (moonlight.getConfigOption<boolean>("userpfp", "preferNitro") && user.avatar?.startsWith("a_")) return original(user, animated, size);

    return getUrl(user.id, animated) ?? original(user, animated, size);
}

function getUrl(id: string, animated: boolean) {
    if (!data.avatars[id])
        return null;

    let url = new URL(data.avatars[id]);
    if (url && !animated) {
        // Weak attempt to automatically find a non-animated version
        url.pathname = url.pathname.replaceAll(/\.gifv?/g, ".png");
    }

    // If the above fails (as is the case for any non-github links), ask the host nicely
    url.searchParams.set("animated", animated ? "true" : "false");

    return url.toString();
}

async function getData() {
    await fetch(moonlight.getConfigOption<string>("userpfp", "apiUrl")!)
        .then(async res => {
            if (res.ok) this.data = data = await res.json();
        })
        .catch(() => null);
}

getData();