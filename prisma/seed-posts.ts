import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const publicPosts = [
  {
    title: "Bom dia, amor",
    description: "Acordei pensando em vocês. Um beijinho da sua Rayalla pra começar bem o dia.",
    isPremium: false,
    contentTier: "FREE",
    published: true,
  },
  {
    title: "Saudades de vocês",
    description: "Passando aqui pra dizer que estou com saudades. Vem me ver no premium, tô te esperando.",
    isPremium: false,
    contentTier: "FREE",
    published: true,
  },
  {
    title: "Nova semana, novo conteúdo",
    description: "Essa semana tem muita coisa nova vindo por aí. Corre pra assinar e não perder nada.",
    isPremium: false,
    contentTier: "FREE",
    published: true,
  },
];

const premiumPosts = [
  {
    title: "Ensaio de lingerie - parte 1",
    description: "Esse ensaio ficou demais. Escolhi as peças mais lindas que tenho e não economizei em nada.",
    isPremium: true,
    contentTier: "BASIC",
    published: true,
  },
  {
    title: "Tarde quentinha em casa",
    description: "Estava tão calor que não aguentei ficar com roupa. Vim compartilhar esse momento com você.",
    isPremium: true,
    contentTier: "BASIC",
    published: true,
  },
  {
    title: "De banho tomado pra você",
    description: "Saindo do banho e vim direto aqui mostrar pra você. Ainda úmida, do jeito que você gosta.",
    isPremium: true,
    contentTier: "PREMIUM",
    published: true,
  },
  {
    title: "Vídeo especial de quinta",
    description: "Toda quinta tem algo especial aqui. Esse é o mais ousado que já postei, corre ver antes que eu mude de ideia.",
    isPremium: true,
    contentTier: "PREMIUM",
    published: true,
  },
  {
    title: "Pedido especial da semana",
    description: "Um fã me pediu esse ensaio e eu resolvi fazer. Se você quer sugerir algo, me manda mensagem.",
    isPremium: true,
    contentTier: "PREMIUM",
    published: true,
    likeCount: 42,
  },
  {
    title: "Sem filtro, só eu",
    description: "Hoje resolvi mostrar tudo sem filtro, sem edição, sem maquiagem. Só eu, do jeito que sou.",
    isPremium: true,
    contentTier: "PREMIUM",
    published: true,
    likeCount: 87,
  },
];

async function main() {
  const existing = await prisma.post.count();
  if (existing > 0) {
    console.log(`Já existem ${existing} posts. Pulando seed.`);
    return;
  }

  for (const post of publicPosts) {
    await prisma.post.create({ data: post });
  }
  console.log(`✓ ${publicPosts.length} posts públicos criados`);

  for (const post of premiumPosts) {
    await prisma.post.create({ data: post });
  }
  console.log(`✓ ${premiumPosts.length} posts premium criados`);

  // Atualiza o admin com bio
  await prisma.user.updateMany({
    where: { role: "ADMIN" },
    data: {
      name: "Rayalla",
      bio: "Aqui é onde eu me solto de verdade. Conteúdo exclusivo, sem censura e direto pra você. Assine e vem comigo.",
      avatarUrl: "/creator.jpg",
    },
  });
  console.log("✓ Perfil da criadora atualizado");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
