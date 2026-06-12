import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const users = [
  { username: "mia_bakes", name: "Mia Johnson", bio: "Pastry chef & cake lover 🎂", avatar: "https://i.pravatar.cc/150?img=47" },
  { username: "chef_kai", name: "Kai Rasmussen", bio: "Professional chef. Food is art 🍽️", avatar: "https://i.pravatar.cc/150?img=68" },
  { username: "tastypasta", name: "Laura M", bio: "Pasta obsessed 🍝 | Copenhagen", avatar: "https://i.pravatar.cc/150?img=45" },
  { username: "sugarlab", name: "Emma Sugar", bio: "Dessert queen 👑 | Recipes & more", avatar: "https://i.pravatar.cc/150?img=44" },
  { username: "nordic_eats", name: "Ole Hansen", bio: "Nordic cuisine enthusiast 🌿", avatar: "https://i.pravatar.cc/150?img=60" },
  { username: "brunchclub", name: "Sara K", bio: "Weekend brunch is religion 🥞", avatar: "https://i.pravatar.cc/150?img=48" },
  { username: "spicy_kitchen", name: "Marco Rossi", bio: "Hot food hot takes 🌶️", avatar: "https://i.pravatar.cc/150?img=57" },
  { username: "cake_studio", name: "Nina Berg", bio: "Custom cakes & sweets 🍰", avatar: "https://i.pravatar.cc/150?img=49" },
  { username: "fitmeals_dk", name: "Thomas N", bio: "Healthy but delicious 💪", avatar: "https://i.pravatar.cc/150?img=65" },
  { username: "streetfood_cph", name: "Amira Hassan", bio: "Street food lover 🌮 | Copenhagen", avatar: "https://i.pravatar.cc/150?img=46" },
];

const foodImages = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600",
  "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3df9?w=600",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600",
];

const captions = [
  "Made this beauty this morning 😍 couldn't wait to share",
  "Sunday brunch hits different when you make it yourself 🥐",
  "Recipe in bio! This one took 3 tries to perfect 👨‍🍳",
  "Simple ingredients, incredible results ✨",
  "My grandma's recipe, finally nailed it 💛",
  "Weekend cooking is my therapy 🙏",
  "Can't stop making this, it's too good 😅",
  "Fresh from the oven 🔥",
  "Meal prep Sunday, staying on track 💪",
  "This took 2 hours but so worth it",
  "Comfort food season is here 🍂",
  "Plating practice today — getting better!",
  "The secret ingredient is always love ❤️",
  "Market fresh, made with care 🌿",
  "Cooked this for the whole family, zero leftovers 😂",
];

const commentList = [
  "This looks incredible! 😍",
  "Recipe please!!",
  "Making this tonight 🙌",
  "You always post the best food",
  "OMG this is goals",
  "Followed! Love your content",
  "How long did this take?",
  "The plating is everything ✨",
  "I need this in my life rn",
  "Okay I'm hungry now 😭",
  "This is art 🎨",
  "Saving this for the weekend!",
];

async function main() {
  console.log("Seeding fake users and posts...");

  const password = await bcrypt.hash("password123", 10);
  const createdUsers = [];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        username: u.username,
        name: u.name,
        email: `${u.username}@foodgram.fake`,
        passwordHash: password,
        bio: u.bio,
        avatar: u.avatar,
      },
    });
    createdUsers.push(user);
    console.log(`Created user: @${user.username}`);
  }

  // Follows
  for (const user of createdUsers) {
    const others = createdUsers.filter((u) => u.id !== user.id);
    const toFollow = others.sort(() => Math.random() - 0.5).slice(0, 5);
    for (const target of toFollow) {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: user.id, followingId: target.id } },
        update: {},
        create: { followerId: user.id, followingId: target.id },
      });
    }
  }
  console.log("Created follows");

  // Posts
  const allPosts = [];
  for (const user of createdUsers) {
    const numPosts = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numPosts; i++) {
      const imgUrl = foodImages[Math.floor(Math.random() * foodImages.length)];
      const caption = captions[Math.floor(Math.random() * captions.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const post = await prisma.post.create({
        data: {
          userId: user.id,
          caption,
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          images: { create: [{ url: imgUrl, order: 0 }] },
        },
      });
      allPosts.push(post);
    }
  }
  console.log(`Created ${allPosts.length} posts`);

  // Likes and comments
  for (const post of allPosts) {
    const likers = [...createdUsers].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 8) + 2);
    for (const liker of likers) {
      if (liker.id === post.userId) continue;
      await prisma.like.upsert({
        where: { userId_postId: { userId: liker.id, postId: post.id } },
        update: {},
        create: { userId: liker.id, postId: post.id },
      });
    }
    const commenters = [...createdUsers].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1);
    for (const commenter of commenters) {
      const text = commentList[Math.floor(Math.random() * commentList.length)];
      await prisma.comment.create({
        data: { userId: commenter.id, postId: post.id, text },
      });
    }
  }
  console.log("Created likes and comments");
  console.log("Done! ✅");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
