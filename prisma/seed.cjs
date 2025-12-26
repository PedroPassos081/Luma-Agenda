/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando o seed...')

  // =======================================================
  // LIMPEZA
  // =======================================================
  await prisma.grade.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.classSubject.deleteMany()
  await prisma.class.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.student.deleteMany()
  await prisma.user.deleteMany()
  await prisma.schoolSettings.deleteMany()

  console.log('🧹 Banco limpo.')

  // =======================================================
  //  CONFIGURAÇÕES
  // =======================================================
  await prisma.schoolSettings.create({
    data: {
      schoolName: "Escola Modelo Luma",
      currentYear: "2025",
      passingGrade: 7.0,
      periodicity: "BIMESTRAL"
    }
  })

  // =======================================================
  // USUÁRIOS
  // =======================================================
  const passwordHash = await bcrypt.hash('123456', 10)

  // Criamos o admin sem guardar em variável (pois não usamos depois)
  await prisma.user.create({
    data: {
      name: 'Diretor Carlos',
      email: 'admin@schoolflow.dev',
      password: passwordHash,
      role: 'ADMIN',
    },
  })

  const profMat = await prisma.user.create({
    data: {
      name: 'Prof. Roberto (Exatas)',
      email: 'roberto@schoolflow.dev',
      password: passwordHash,
      role: 'TEACHER',
    },
  })

  const profPort = await prisma.user.create({
    data: {
      name: 'Prof. Cláudia (Humanas)',
      email: 'claudia@schoolflow.dev',
      password: passwordHash,
      role: 'TEACHER',
    },
  })

  // Criamos o pai sem guardar em variável
  await prisma.user.create({
    data: {
      name: 'Sr. João Silva',
      email: 'pai@schoolflow.dev',
      password: passwordHash,
      role: 'PARENT',
    },
  })

  console.log('✅ Usuários criados.')

  // =======================================================
  // MATÉRIAS
  // =======================================================
  const mat = await prisma.subject.create({
    data: { name: 'Matemática', code: 'MAT' }
  })

  const port = await prisma.subject.create({
    data: { name: 'Português', code: 'PORT' }
  })

  // Criamos história sem guardar em variável 
  await prisma.subject.create({
    data: { name: 'História', code: 'HIS' }
  })

  console.log('✅ Disciplinas criadas.')

  // =======================================================
  // TURMAS
  // =======================================================
  const turma6A = await prisma.class.create({
    data: {
      name: '6º Ano A',
      grade: '6º Ano',
      year: 2025,
      shift: 'MORNING',
      segment: 'FUNDAMENTAL_II',
    },
  })

  const turma1B = await prisma.class.create({
    data: {
      name: '1º Ano B',
      grade: '1º Ano',
      year: 2025,
      shift: 'AFTERNOON',
      segment: 'FUNDAMENTAL_I',
    },
  })

  console.log('✅ Turmas criadas.')

  // =======================================================
  // GRADE CURRICULAR
  // =======================================================

  await prisma.classSubject.create({
    data: {
      classId: turma6A.id,
      subjectId: mat.id,
      teacherId: profMat.id
    }
  })

  await prisma.classSubject.create({
    data: {
      classId: turma6A.id,
      subjectId: port.id,
      teacherId: profPort.id
    }
  })

  await prisma.classSubject.create({
    data: {
      classId: turma1B.id,
      subjectId: port.id,
      teacherId: profPort.id
    }
  })

  console.log('✅ Grade curricular vinculada.')

  // =======================================================
  //  ALUNOS
  // =======================================================
  const aluno1 = await prisma.student.create({
    data: {
      name: 'Pedrinho Silva',
      guardianName: 'Sr. João Silva',
      guardianEmail: 'pai@schoolflow.dev',
    }
  })

  await prisma.enrollment.create({
    data: {
      studentId: aluno1.id,
      classId: turma6A.id
    }
  })

  console.log('✅ Aluno matriculado.')
  console.log('🚀 Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })