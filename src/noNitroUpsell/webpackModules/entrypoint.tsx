import { UserStore } from "@moonlight-mod/wp/common_stores";
import { User } from "@moonlight-mod/types";

let user: ModifiedUser | undefined;
let lastUserId: string | undefined;

interface ModifiedUser extends User {
  _realPremiumType?: number;
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

  user._realPremiumType = user.premiumType ?? 0;
  user.premiumType = 2;
  lastUserId = user.id;
}

user = UserStore.getCurrentUser();
if (user) ready(user);

UserStore.addChangeListener(onChange);