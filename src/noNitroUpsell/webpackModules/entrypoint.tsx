import { UserStore } from "@moonlight-mod/wp/common_stores";
import { User } from "@moonlight-mod/types";

let user: ModifiedUser | undefined;
let lastUserId: string | undefined;

interface ModifiedUser extends User {
  _realPremiumType?: number;
}

let exemptSkuFeatures = [
  "soundboardEverywhere",
  "clientThemes",
  "profilePremiumFeatures",
  "premiumProfileCustomization",
  "boostDiscount",
  "freeBoosts",
];

export function checkRealSkuSupport(feature, user, originalValue) {
  if (feature === "canAcceptGifts") { // Special magic value defined by a patch
    return user._realPremiumType == 2;
  }

  if (exemptSkuFeatures.includes(feature.name)) {
    return originalValue;
  }

  return true;
}

const onChange = () => {
  const newUser = UserStore.getCurrentUser();
  if (newUser && newUser.id !== lastUserId) {
    user = newUser;
    ready(user);
  }
};

function ready(user: ModifiedUser) {
  if (!user) return;
  if ("_realPremiumType" in user) return;

  user._realPremiumType = user.premiumType;
  user.premiumType = 2;
  lastUserId = user.id;
}

user = UserStore.getCurrentUser();
if (user) ready(user);

UserStore.addChangeListener(onChange);