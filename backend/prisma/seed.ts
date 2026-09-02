import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ClientFlow database with realistic operations dataset...');

  // Clean existing records in reverse dependency order
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.clientContact.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  const sarahAdmin = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'admin@clientflow.io',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isActive: true
    }
  });

  const michaelManager = await prisma.user.create({
    data: {
      name: 'Michael Scott',
      email: 'manager@clientflow.io',
      passwordHash: defaultPasswordHash,
      role: 'MANAGER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isActive: true
    }
  });

  const elenaManager = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.rostova@clientflow.io',
      passwordHash: defaultPasswordHash,
      role: 'MANAGER',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      isActive: true
    }
  });

  const alexMember = await prisma.user.create({
    data: {
      name: 'Alex Chen',
      email: 'alex.chen@clientflow.io',
      passwordHash: defaultPasswordHash,
      role: 'MEMBER',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isActive: true
    }
  });

  const jessicaMember = await prisma.user.create({
    data: {
      name: 'Jessica Taylor',
      email: 'jessica.taylor@clientflow.io',
      passwordHash: defaultPasswordHash,
      role: 'MEMBER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isActive: true
    }
  });

  console.log('Created 5 users.');

  // 2. Create Clients & Contacts
  const apexClient = await prisma.client.create({
    data: {
      name: 'Apex Retail Innovations',
      company: 'Apex Holdings LLC',
      email: 'partnerships@apexretail.com',
      phone: '+1 (415) 555-0192',
      website: 'https://apexretail.com',
      address: '742 Montgomery St, San Francisco, CA',
      status: 'ACTIVE',
      notes: 'Key enterprise account. Focus on omnichannel checkout performance.',
      contacts: {
        create: [
          {
            name: 'David Vance',
            email: 'dvance@apexretail.com',
            phone: '+1 (415) 555-0193',
            title: 'VP of Digital Commerce',
            isPrimary: true
          },
          {
            name: 'Rachel Zane',
            email: 'rzane@apexretail.com',
            phone: '+1 (415) 555-0194',
            title: 'Head of Engineering'
          }
        ]
      }
    }
  });

  const luminaClient = await prisma.client.create({
    data: {
      name: 'Lumina Health Technologies',
      company: 'Lumina Health Inc.',
      email: 'operations@luminahealth.io',
      phone: '+1 (617) 555-0144',
      website: 'https://luminahealth.io',
      address: '100 Federal Street, Boston, MA',
      status: 'ACTIVE',
      notes: 'HIPAA compliant patient telemetry ecosystem.',
      contacts: {
        create: [
          {
            name: 'Dr. Marcus Vance',
            email: 'marcus@luminahealth.io',
            phone: '+1 (617) 555-0145',
            title: 'Chief Medical Officer',
            isPrimary: true
          }
        ]
      }
    }
  });

  const nexaClient = await prisma.client.create({
    data: {
      name: 'NexaWave Cloud Systems',
      company: 'NexaWave Corp',
      email: 'tech@nexawave.com',
      phone: '+1 (206) 555-0177',
      website: 'https://nexawave.com',
      address: '1201 3rd Ave, Seattle, WA',
      status: 'ACTIVE',
      notes: 'Multi-region Kubernetes migration contract.',
      contacts: {
        create: [
          {
            name: 'Brian Thorne',
            email: 'brian@nexawave.com',
            phone: '+1 (206) 555-0178',
            title: 'Director of Cloud Infrastructure',
            isPrimary: true
          }
        ]
      }
    }
  });

  const horizonClient = await prisma.client.create({
    data: {
      name: 'Horizon Logistics',
      company: 'Horizon Freight International',
      email: 'supply@horizonlogistics.com',
      phone: '+1 (312) 555-0129',
      website: 'https://horizonlogistics.com',
      address: '200 E Randolph St, Chicago, IL',
      status: 'ON_HOLD',
      notes: 'Pending budget approval for Q4 expansion.',
      contacts: {
        create: [
          {
            name: 'Samantha Cole',
            email: 'scole@horizonlogistics.com',
            phone: '+1 (312) 555-0130',
            title: 'VP of Operations',
            isPrimary: true
          }
        ]
      }
    }
  });

  const solarisClient = await prisma.client.create({
    data: {
      name: 'Solaris Renewable Energy',
      company: 'Solaris Power Dynamics',
      email: 'info@solarispower.com',
      phone: '+1 (512) 555-0188',
      website: 'https://solarispower.com',
      address: '301 Congress Ave, Austin, TX',
      status: 'LEAD',
      notes: 'Prospective client interested in solar array telemetry dashboards.',
      contacts: {
        create: [
          {
            name: 'Austin Matthews',
            email: 'amatthews@solarispower.com',
            phone: '+1 (512) 555-0189',
            title: 'Director of Business Development',
            isPrimary: true
          }
        ]
      }
    }
  });

  const vantageClient = await prisma.client.create({
    data: {
      name: 'Vantage Financial Group',
      company: 'Vantage Global Capital',
      email: 'advisory@vantagefinancial.com',
      phone: '+1 (212) 555-0111',
      website: 'https://vantagefinancial.com',
      address: '200 Park Ave, New York, NY',
      status: 'COMPLETED',
      notes: 'Phase 1 core modernization delivered successfully.',
      contacts: {
        create: [
          {
            name: 'Harrison Sterling',
            email: 'hsterling@vantagefinancial.com',
            phone: '+1 (212) 555-0112',
            title: 'Managing Partner',
            isPrimary: true
          }
        ]
      }
    }
  });

  console.log('Created 6 clients with contacts.');

  // 3. Create Projects & Memberships
  const proj1 = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform Redesign 2.0',
      description: 'Next-generation headless commerce frontend with sub-second page loads and automated checkout flows.',
      clientId: apexClient.id,
      status: 'ACTIVE',
      priority: 'URGENT',
      startDate: new Date('2026-08-01'),
      targetEndDate: new Date('2026-10-31'),
      budget: 125000,
      members: {
        create: [
          { userId: michaelManager.id, role: 'LEAD' },
          { userId: alexMember.id, role: 'CONTRIBUTOR' },
          { userId: jessicaMember.id, role: 'CONTRIBUTOR' }
        ]
      }
    }
  });

  const proj2 = await prisma.project.create({
    data: {
      name: 'Patient Portal Mobile App',
      description: 'Cross-platform mobile application for appointments, real-time lab results, and secure doctor messaging.',
      clientId: luminaClient.id,
      status: 'ACTIVE',
      priority: 'HIGH',
      startDate: new Date('2026-07-15'),
      targetEndDate: new Date('2026-11-15'),
      budget: 180000,
      members: {
        create: [
          { userId: elenaManager.id, role: 'LEAD' },
          { userId: alexMember.id, role: 'CONTRIBUTOR' }
        ]
      }
    }
  });

  const proj3 = await prisma.project.create({
    data: {
      name: 'Cloud Migration & Microservices',
      description: 'Architectural refactor from monolithic legacy services to scalable Kubernetes clusters.',
      clientId: nexaClient.id,
      status: 'ACTIVE',
      priority: 'HIGH',
      startDate: new Date('2026-06-01'),
      targetEndDate: new Date('2026-09-30'),
      budget: 95000,
      members: {
        create: [
          { userId: sarahAdmin.id, role: 'LEAD' },
          { userId: alexMember.id, role: 'CONTRIBUTOR' }
        ]
      }
    }
  });

  const proj4 = await prisma.project.create({
    data: {
      name: 'Fleet Telematics Dashboard',
      description: 'Real-time GPS tracking and fuel efficiency telemetry dashboard for over 500 freight vehicles.',
      clientId: horizonClient.id,
      status: 'ON_HOLD',
      priority: 'MEDIUM',
      startDate: new Date('2026-05-01'),
      targetEndDate: new Date('2026-12-01'),
      budget: 65000,
      members: {
        create: [
          { userId: michaelManager.id, role: 'LEAD' }
        ]
      }
    }
  });

  const proj5 = await prisma.project.create({
    data: {
      name: 'Solar Farm Grid Telemetry',
      description: 'IoT sensor ingestion pipeline to forecast daily energy yields and detect hardware anomalies.',
      clientId: solarisClient.id,
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: new Date('2026-10-01'),
      targetEndDate: new Date('2027-02-28'),
      budget: 110000,
      members: {
        create: [
          { userId: elenaManager.id, role: 'LEAD' }
        ]
      }
    }
  });

  const proj6 = await prisma.project.create({
    data: {
      name: 'Core Banking API Modernization',
      description: 'High-throughput REST and gRPC API suite with real-time fraud scoring.',
      clientId: vantageClient.id,
      status: 'COMPLETED',
      priority: 'HIGH',
      startDate: new Date('2026-01-10'),
      targetEndDate: new Date('2026-06-30'),
      actualEndDate: new Date('2026-06-25'),
      budget: 220000,
      members: {
        create: [
          { userId: sarahAdmin.id, role: 'LEAD' },
          { userId: michaelManager.id, role: 'CONTRIBUTOR' }
        ]
      }
    }
  });

  console.log('Created 6 projects.');

  // 4. Create Realistic Tasks
  const tasksData = [
    // Project 1 tasks (Apex)
    {
      title: 'Design cart and multi-step checkout UI flows',
      description: 'Create high-fidelity Figma components with guest checkout and Apple Pay flows.',
      projectId: proj1.id,
      assigneeId: jessicaMember.id,
      creatorId: michaelManager.id,
      priority: 'HIGH',
      status: 'DONE',
      dueDate: new Date('2026-08-20'),
      completedAt: new Date('2026-08-19'),
      estimatedHours: 24
    },
    {
      title: 'Implement Stripe Elements & PayPal integration',
      description: 'Setup backend webhooks with idempotency keys and support 3D Secure verification.',
      projectId: proj1.id,
      assigneeId: alexMember.id,
      creatorId: michaelManager.id,
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // due in 2 days
      estimatedHours: 32
    },
    {
      title: 'ElasticSearch product catalog indexing',
      description: 'Build automated sync indexers with typo-tolerance and faceted filtering.',
      projectId: proj1.id,
      assigneeId: alexMember.id,
      creatorId: michaelManager.id,
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedHours: 40
    },
    {
      title: 'Setup Lighthouse CI benchmark gates',
      description: 'Enforce performance score > 90 on all product detail pull requests.',
      projectId: proj1.id,
      assigneeId: alexMember.id,
      creatorId: michaelManager.id,
      priority: 'MEDIUM',
      status: 'IN_REVIEW',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      estimatedHours: 12
    },

    // Project 2 tasks (Lumina)
    {
      title: 'Implement biometric FaceID / TouchID auth',
      description: 'Integrate native biometric authentication for fast patient login.',
      projectId: proj2.id,
      assigneeId: alexMember.id,
      creatorId: elenaManager.id,
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      estimatedHours: 20
    },
    {
      title: 'HIPAA end-to-end encrypted messaging bridge',
      description: 'Implement WebSocket chat with AES-256-GCM client-side encryption.',
      projectId: proj2.id,
      assigneeId: alexMember.id,
      creatorId: elenaManager.id,
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      estimatedHours: 48
    },
    {
      title: 'Lab results PDF report generator',
      description: 'Generate accessible PDF reports with charted historical trend indicators.',
      projectId: proj2.id,
      assigneeId: jessicaMember.id,
      creatorId: elenaManager.id,
      priority: 'MEDIUM',
      status: 'DONE',
      dueDate: new Date('2026-08-25'),
      completedAt: new Date('2026-08-24'),
      estimatedHours: 16
    },

    // Project 3 tasks (NexaWave)
    {
      title: 'Helm charts and ArgoCD deployment pipeline',
      description: 'Automate declarative blue/green rollouts on staging and production clusters.',
      projectId: proj3.id,
      assigneeId: alexMember.id,
      creatorId: sarahAdmin.id,
      priority: 'HIGH',
      status: 'DONE',
      dueDate: new Date('2026-08-15'),
      completedAt: new Date('2026-08-14'),
      estimatedHours: 30
    },
    {
      title: 'Database connection pooling with PgBouncer',
      description: 'Tune connection limits and idle timeouts to support 5,000 concurrent sockets.',
      projectId: proj3.id,
      assigneeId: alexMember.id,
      creatorId: sarahAdmin.id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      estimatedHours: 16
    },

    // Project 4 tasks (Horizon - On Hold)
    {
      title: 'Kafka GPS stream ingestion benchmark',
      description: 'Stress test ingestion cluster up to 50k events/sec under simulated network latency.',
      projectId: proj4.id,
      assigneeId: alexMember.id,
      creatorId: michaelManager.id,
      priority: 'MEDIUM',
      status: 'BLOCKED',
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Overdue
      estimatedHours: 25
    },

    // Project 6 tasks (Vantage - Done)
    {
      title: 'Zero-trust mTLS gateway setup',
      description: 'Enforce mutual TLS on all internal service mesh calls.',
      projectId: proj6.id,
      assigneeId: alexMember.id,
      creatorId: sarahAdmin.id,
      priority: 'URGENT',
      status: 'DONE',
      dueDate: new Date('2026-06-10'),
      completedAt: new Date('2026-06-08'),
      estimatedHours: 40
    }
  ];

  for (const t of tasksData) {
    await prisma.task.create({ data: t });
  }

  console.log(`Created ${tasksData.length} tasks.`);

  // 5. Create Documents
  await prisma.document.create({
    data: {
      fileName: 'Apex_Architecture_Specification_v2.pdf',
      originalName: 'Apex_Architecture_Specification_v2.pdf',
      fileSize: 4200000,
      mimeType: 'application/pdf',
      storageKey: 'seed_apex_arch_v2.pdf',
      storagePath: './uploads/seed_apex_arch_v2.pdf',
      clientId: apexClient.id,
      projectId: proj1.id,
      uploadedById: michaelManager.id
    }
  });

  await prisma.document.create({
    data: {
      fileName: 'Lumina_HIPAA_Compliance_Matrix.xlsx',
      originalName: 'Lumina_HIPAA_Compliance_Matrix.xlsx',
      fileSize: 1850000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      storageKey: 'seed_lumina_hipaa.xlsx',
      storagePath: './uploads/seed_lumina_hipaa.xlsx',
      clientId: luminaClient.id,
      projectId: proj2.id,
      uploadedById: elenaManager.id
    }
  });

  console.log('Created sample documents.');

  // 6. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: alexMember.id,
        title: 'Task Assigned',
        message: 'You have been assigned to "Implement Stripe Elements & PayPal integration"',
        type: 'TASK_ASSIGNED',
        link: `/tasks`,
        isRead: false
      },
      {
        userId: alexMember.id,
        title: 'Approaching Deadline',
        message: 'Task "Database connection pooling with PgBouncer" is due tomorrow',
        type: 'SYSTEM',
        link: `/tasks`,
        isRead: false
      },
      {
        userId: jessicaMember.id,
        title: 'Project Added',
        message: 'You were added as Contributor to "E-Commerce Platform Redesign 2.0"',
        type: 'PROJECT_UPDATED',
        link: `/projects/${proj1.id}`,
        isRead: true,
        readAt: new Date()
      }
    ]
  });

  // 7. Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        actorId: sarahAdmin.id,
        action: 'CLIENT_CREATED',
        entityType: 'CLIENT',
        entityId: apexClient.id,
        clientId: apexClient.id,
        metadata: JSON.stringify({ name: apexClient.name, status: 'ACTIVE' })
      },
      {
        actorId: michaelManager.id,
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: proj1.id,
        clientId: apexClient.id,
        projectId: proj1.id,
        metadata: { name: proj1.name, status: proj1.status } ? JSON.stringify({ name: proj1.name, status: proj1.status }) : null
      },
      {
        actorId: michaelManager.id,
        action: 'TASK_ASSIGNED',
        entityType: 'TASK',
        entityId: proj1.id,
        clientId: apexClient.id,
        projectId: proj1.id,
        metadata: JSON.stringify({ title: 'Implement Stripe Elements & PayPal integration', assignee: 'Alex Chen' })
      },
      {
        actorId: alexMember.id,
        action: 'TASK_STATUS_CHANGED',
        entityType: 'TASK',
        entityId: proj1.id,
        clientId: apexClient.id,
        projectId: proj1.id,
        metadata: JSON.stringify({ title: 'Design cart and multi-step checkout UI flows', previousStatus: 'IN_REVIEW', newStatus: 'DONE' })
      }
    ]
  });

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
