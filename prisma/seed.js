const { PrismaClient } = require("@prisma/client");
const { scryptSync, randomBytes } = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  // await prisma.user.deleteMany({
  //   where: {
  //     email: {
  //       in: ["ana@cuida.local", "laura@cuida.local"],
  //     },
  //   },
  // });

  const nicolas = await prisma.user.upsert({
    where: { email: "test@gmail.com" },
    update: {
      name: "Nicolás Placente",
      passwordHash: hashPassword("test"),
    },
    create: {
      name: "Nicolás Placente",
      email: "test@gmail.com",
      avatar: "/cuida.png",
      passwordHash: hashPassword("test"),
    },
  });

  const circle = await prisma.careCircle.upsert({
    where: { id: "demo-circle" },
    update: {},
    create: {
      id: "demo-circle",
      name: "Familia de María",
      patient: {
        create: {
          name: "María",
          age: 82,
          photo: "/cuida-full.png",
          medicalCondition: "Alzheimer etapa inicial",
          importantNotes:
            "Prefiere desayunar temprano. Puede confundirse si cambia la rutina.",
        },
      },
    },
  });

  await prisma.careCircleMember.upsert({
    where: {
      userId_careCircleId: {
        userId: nicolas.id,
        careCircleId: circle.id,
      },
    },
    update: { role: "ADMIN" },
    create: {
      userId: nicolas.id,
      careCircleId: circle.id,
      role: "ADMIN",
    },
  });

  await prisma.medication.createMany({
    data: [
      {
        id: "demo-med-donepezilo",
        careCircleId: circle.id,
        name: "Donepezilo",
        dose: "10 mg",
        schedule: "08:00",
        frequency: "Todos los días",
        instructions: "Administrar después del desayuno.",
      },
      {
        id: "demo-med-vitamina-d",
        careCircleId: circle.id,
        name: "Vitamina D",
        dose: "1000 UI",
        schedule: "12:00",
        frequency: "Todos los días",
        instructions: "Tomar con agua.",
      },
      {
        id: "demo-med-melatonina",
        careCircleId: circle.id,
        name: "Melatonina",
        dose: "3 mg",
        schedule: "21:30",
        frequency: "Noche",
        instructions: "Solo si tiene dificultad para dormir.",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.careTask.createMany({
    data: [
      {
        id: "demo-task-breakfast",
        careCircleId: circle.id,
        title: "Preparar desayuno",
        description: "Servir algo liviano y registrar si come poco.",
        scheduledTime: "08:30",
      },
      {
        id: "demo-task-walk",
        careCircleId: circle.id,
        title: "Acompañar caminata",
        description: "Paseo corto por la cuadra si el clima ayuda.",
        scheduledTime: "10:30",
      },
      {
        id: "demo-task-pressure",
        careCircleId: circle.id,
        title: "Controlar presión",
        description: "Registrar el valor si está fuera del rango habitual.",
        scheduledTime: "17:00",
      },
      {
        id: "demo-task-dinner",
        careCircleId: circle.id,
        title: "Preparar cena",
        scheduledTime: "20:00",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.calendarEvent.upsert({
    where: { id: "demo-event-neurology" },
    update: {},
    create: {
      id: "demo-event-neurology",
      careCircleId: circle.id,
      title: "Consulta neurológica",
      date: new Date(),
      time: "16:00",
      location: "Centro Médico Norte",
      notes: "Llevar últimos estudios y lista de medicamentos.",
    },
  });

  await prisma.dailyLog.upsert({
    where: { id: "demo-log-meal" },
    update: {},
    create: {
      id: "demo-log-meal",
      careCircleId: circle.id,
      userId: nicolas.id,
      type: "MEAL",
      content: "Comió poco al mediodía y estuvo cansada.",
      occurredAt: new Date(),
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        id: "demo-activity-note",
        careCircleId: circle.id,
        userId: nicolas.id,
        type: "NOTE_CREATED",
        message: "Nicolás agregó una nota al historial diario.",
      },
      {
        id: "demo-activity-event",
        careCircleId: circle.id,
        userId: nicolas.id,
        type: "EVENT_CREATED",
        message: "Nicolás creó un turno médico.",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
