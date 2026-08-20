import fs from "node:fs";
import path from "node:path";
import { PrismaClient, EntryStatus, ConfidenceLevel, RootCauseCategory, ResourceType, RelationType, ResolutionStatus } from "@prisma/client";

import bcrypt from "bcryptjs";

// Read .env if not already in process.env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [k, ...vParts] = trimmed.split("=");
      const v = vParts.join("=").replace(/(^"|"$|^'|'$)/g, "");
      if (!process.env[k.trim()]) {
        process.env[k.trim()] = v.trim();
      }
    }
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("Seeding Tech Memory Knowledge Base database on Neon...");

  // 0. Create Default Admin User
  const passwordHash = bcrypt.hashSync("AdminPassword123!", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@knowledge.local" },
    update: {
      password: passwordHash,
      name: "Lead Security Engineer",
      role: "ADMIN",
    },
    create: {
      email: "admin@knowledge.local",
      name: "Lead Security Engineer",
      password: passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin user provisioned:", adminUser.email);

  // 1. Create Default Categories
  const categoriesData = [
    { name: "Sécurité & SIEM", slug: "securite-siem", icon: "Shield", description: "SIEM, Wazuh, IDS/IPS, SOC, CVEs et audits" },
    { name: "Linux & Système", slug: "linux-systeme", icon: "Terminal", description: "Administration Linux, systemd, mémoire, CPU, kernel" },
    { name: "Réseau & Firewall", slug: "reseau-firewall", icon: "Network", description: "Routage, iptables, nftables, DNS, UDP/TCP, proxies" },
    { name: "TLS & Cryptographie", slug: "tls-crypto", icon: "Lock", description: "OpenSSL, certificats X.509, PKI, truststores, CA" },
    { name: "Conteneurs & K8s", slug: "conteneurs-k8s", icon: "Box", description: "Docker, Kubernetes, Podman, Helm, Ingress, CNI" },
    { name: "CI/CD & DevOps", slug: "cicd-devops", icon: "GitBranch", description: "Jenkins, GitLab CI, GitHub Actions, pipelines, runners" },
    { name: "Bases de données", slug: "bases-de-donnees", icon: "Database", description: "PostgreSQL, MySQL, Redis, indexation, verrous, réplication" },
    { name: "Cloud & Infrastructure", slug: "cloud-infra", icon: "Cloud", description: "AWS, Azure, Terraform, IAM, VPC, passerelles" },
  ];

  const categoryMap: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = created;
  }

  // 2. Create Tags
  const tagsData = [
    { name: "wazuh", slug: "wazuh", color: "#0284c7" },
    { name: "agent", slug: "agent", color: "#0ea5e9" },
    { name: "network", slug: "network", color: "#10b981" },
    { name: "firewall", slug: "firewall", color: "#ef4444" },
    { name: "tls", slug: "tls", color: "#8b5cf6" },
    { name: "openssl", slug: "openssl", color: "#6366f1" },
    { name: "docker", slug: "docker", color: "#06b6d4" },
    { name: "kubernetes", slug: "kubernetes", color: "#3b82f6" },
    { name: "linux", slug: "linux", color: "#f59e0b" },
    { name: "jenkins", slug: "jenkins", color: "#d97706" },
    { name: "postgres", slug: "postgres", color: "#2563eb" },
    { name: "ssl-handshake", slug: "ssl-handshake", color: "#ec4899" },
    { name: "production", slug: "production", color: "#dc2626" },
    { name: "dns", slug: "dns", color: "#14b8a6" },
  ];

  const tagMap: Record<string, any> = {};
  for (const t of tagsData) {
    const created = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
    tagMap[t.slug] = created;
  }

  // 3. Create Sample High-Value Entries

  // Entry 1: Wazuh Manager agent logs issue
  const entry1 = await prisma.knowledgeEntry.upsert({
    where: { readableId: "KB-1001" },
    update: {},
    create: {
      readableId: "KB-1001",
      title: "Wazuh Manager ne reçoit plus les logs des agents",
      slug: "wazuh-manager-ne-recoit-plus-les-logs-des-agents",
      status: EntryStatus.VALIDATED,
      confidenceLevel: ConfidenceLevel.VALIDATED,
      authorName: "Security Engineer",
      isFavorite: true,
      viewCount: 142,
      qualityScore: 95,
      lastTestedAt: new Date("2026-08-18T10:00:00Z"),
      categoryId: categoryMap["securite-siem"].id,
      environment: "Production",
      technologies: JSON.stringify(["Wazuh", "Linux", "UDP", "iptables"]),
      tools: JSON.stringify(["wazuh-manager", "wazuh-agent", "ss", "iptables"]),
      affectedSystems: JSON.stringify(["wazuh-master-01", "endpoint-fleet"]),
      affectedProjects: JSON.stringify(["SOC Infrastructure"]),
      problemDescription:
        "Les agents Wazuh déployés sur les serveurs distants s'affichent comme connectés ou en statut 'never connected', mais le Manager ne stocke aucun événement dans archives.json ni dans les dashboards OpenSearch.",
      contextDescription:
        "Cluster Wazuh Manager 4.8 sur Ubuntu 22.04 LTS derrière un pare-feu matériel et filtrage iptables local.",
      symptoms:
        "Les agents sont actifs et tentent de communiquer, mais le Manager ne reçoit plus les événements. Le fichier /var/ossec/logs/ossec.log de l'agent indique des retries périodiques.",
      errorMessage:
        "2026/08/18 08:14:22 wazuh-agent: WARNING: (4101): Waiting for server reply (server '192.168.10.50')... Connection refused",
      triggerConditions:
        "Survenu suite à la mise à jour des règles de pare-feu réseau et redémarrage du service ufw/iptables sur le serveur master.",
      rootCause:
        "Le port UDP 1514 (utilisé pour le streaming des logs et événements des agents vers le Manager) était bloqué au niveau du pare-feu host iptables suite au rechargement d'une politique par défaut DROP.",
      secondaryCauses:
        "Le port TCP 1515 pour l'enregistrement fonctionnait, masquant le fait que le canal de données UDP 1514 était bloqué.",
      responsibleComponent: "iptables / Firewall daemon",
      triggerFactor: "Rechargement inopiné des règles de firewalling sans persistance des règles UDP",
      rootCauseCategory: RootCauseCategory.SECURITY,
      quickSolution:
        "Autoriser le flux UDP sur le port 1514 sur le pare-feu du Wazuh Manager, vérifier l'écoute avec 'ss -lunp | grep 1514', puis redémarrer wazuh-manager.",
      validationTested: true,
      validationEnvironment: "Production (Cluster 500 agents)",
      validationResult: "100% des agents ont repris l'envoi de logs sous 60 secondes.",
      hasRegression: false,
    },
  });

  // Entry 1 relations, tags, commands, steps, investigations
  await prisma.tagsOnKnowledgeEntry.createMany({
    data: [
      { entryId: entry1.id, tagId: tagMap["wazuh"].id },
      { entryId: entry1.id, tagId: tagMap["agent"].id },
      { entryId: entry1.id, tagId: tagMap["network"].id },
      { entryId: entry1.id, tagId: tagMap["firewall"].id },
      { entryId: entry1.id, tagId: tagMap["production"].id },
    ],
    skipDuplicates: true,
  });

  await prisma.commandSnippet.createMany({
    data: [
      {
        entryId: entry1.id,
        language: "bash",
        command: "ss -lunp | grep 1514",
        description: "Vérifier si le service Wazuh Manager écoute sur le port UDP 1514",
        context: "À exécuter sur le serveur Wazuh Manager",
        expectedOutput: "UNCONN 0 0 0.0.0.0:1514 0.0.0.0:* users:((\"wazuh-remoted\",pid=2415,fd=7))",
        tags: JSON.stringify(["wazuh", "network", "ss"]),
      },
      {
        entryId: entry1.id,
        language: "bash",
        command: "iptables -A INPUT -p udp --dport 1514 -j ACCEPT\niptables -A INPUT -p tcp --dport 1515 -j ACCEPT\nnetfilter-persistent save",
        description: "Ouvrir les ports UDP 1514 et TCP 1515 et persister les règles",
        context: "Sous Debian / Ubuntu avec netfilter-persistent",
        expectedOutput: "Updated iptables rules successfully saved.",
        tags: JSON.stringify(["iptables", "firewall", "security"]),
      },
      {
        entryId: entry1.id,
        language: "bash",
        command: "systemctl restart wazuh-manager\ntail -f /var/ossec/logs/ossec.log",
        description: "Redémarrer le manager et vérifier la prise en compte des connexions",
        context: "Manager Wazuh",
        expectedOutput: "wazuh-remoted: INFO: Started (pid: 3120). Listening on port 1514/UDP",
        tags: JSON.stringify(["systemctl", "wazuh", "logs"]),
      },
    ],
    skipDuplicates: true,
  });

  await prisma.investigationStep.createMany({
    data: [
      {
        entryId: entry1.id,
        stepNumber: 1,
        hypothesis: "Le démon wazuh-manager est arrêté ou a crashé.",
        command: "systemctl status wazuh-manager",
        result: "Active: active (running)",
        conclusion: "Le démon tourne correctement.",
      },
      {
        entryId: entry1.id,
        stepNumber: 2,
        hypothesis: "Le service n'écoute pas sur le port 1514 UDP.",
        command: "ss -lunp | grep 1514",
        result: "UNCONN 0 0 0.0.0.0:1514 ... wazuh-remoted",
        conclusion: "Le processus écoute bien localement.",
      },
      {
        entryId: entry1.id,
        stepNumber: 3,
        hypothesis: "Le filtrage de paquets iptables bloque l'entrée UDP 1514.",
        command: "iptables -L -n -v | grep 1514",
        result: "Aucune règle correspondante, politique INPUT par défaut: DROP",
        conclusion: "Cause confirmée : paquet bloqué par iptables DROP par défaut.",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.resolutionStep.createMany({
    data: [
      {
        entryId: entry1.id,
        stepNumber: 1,
        title: "Vérifier le statut du service",
        description: "S'assurer que wazuh-remoted est actif.",
        command: "systemctl status wazuh-manager",
        expectedResult: "Active: active (running)",
        order: 1,
      },
      {
        entryId: entry1.id,
        stepNumber: 2,
        title: "Ajouter la règle de pare-feu",
        description: "Autoriser explicitement le port 1514 en UDP.",
        command: "iptables -I INPUT 1 -p udp --dport 1514 -m comment --comment 'Wazuh Agent UDP' -j ACCEPT",
        expectedResult: "Règle insérée en tête de chaîne INPUT",
        order: 2,
      },
      {
        entryId: entry1.id,
        stepNumber: 3,
        title: "Sauvegarder et tester",
        description: "Persister la configuration et observer la reprise des flux.",
        command: "netfilter-persistent save && tcpdump -i any udp port 1514 -c 5",
        expectedResult: "Paquets UDP reçus des IP agents",
        order: 3,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.resourceLink.createMany({
    data: [
      {
        entryId: entry1.id,
        title: "Documentation officielle Wazuh — Required Ports",
        url: "https://documentation.wazuh.com/current/getting-started/architecture.html#required-ports",
        resourceType: ResourceType.OFFICIAL_DOC,
        description: "Spécification des ports 1514 UDP/TCP et 1515 TCP pour le SIEM.",
        source: "wazuh.com",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.resolutionHistory.createMany({
    data: [
      {
        entryId: entry1.id,
        testedAt: new Date("2026-08-18T10:00:00Z"),
        testerName: "SecOps Admin",
        environment: "Production",
        resultStatus: ResolutionStatus.SUCCESS,
        notes: "Déblocage immédiat sur l'ensemble du parc de 500 agents.",
      },
      {
        entryId: entry1.id,
        testedAt: new Date("2026-06-12T14:30:00Z"),
        testerName: "DevOps Engineer",
        environment: "Staging",
        resultStatus: ResolutionStatus.SUCCESS,
        notes: "Même issue constatée lors du provisionnement Ansible.",
      },
    ],
    skipDuplicates: true,
  });

  // Entry 2: OpenSSL SSL Handshake & Certificate Chain error
  const entry2 = await prisma.knowledgeEntry.upsert({
    where: { readableId: "KB-1002" },
    update: {},
    create: {
      readableId: "KB-1002",
      title: "Erreur OpenSSL: unable to get local issuer certificate sur API Gateway",
      slug: "erreur-openssl-unable-to-get-local-issuer-certificate-api-gateway",
      status: EntryStatus.VALIDATED,
      confidenceLevel: ConfidenceLevel.VALIDATED,
      authorName: "AppSec Lead",
      isFavorite: true,
      viewCount: 98,
      qualityScore: 92,
      lastTestedAt: new Date("2026-07-20T16:00:00Z"),
      categoryId: categoryMap["tls-crypto"].id,
      environment: "Production",
      technologies: JSON.stringify(["OpenSSL", "Nginx", "TLS", "PKI"]),
      tools: JSON.stringify(["openssl", "curl", "nginx"]),
      affectedSystems: JSON.stringify(["api-gateway-edge", "microservices"]),
      affectedProjects: JSON.stringify(["Public API"]),
      problemDescription:
        "Les clients appelant l'API Gateway rencontrent des erreurs SSL Handshake. Les requêtes cURL et scripts Python échouent avec l'erreur de validation du certificat émetteur.",
      contextDescription:
        "Reverse proxy Nginx servant de passerelle API sous Linux Debian avec un certificat SSL Let's Encrypt / Sectigo récemment renouvelé.",
      symptoms:
        "Les navigateurs récents fonctionnent (grâce à AIA Fetching), mais tous les clients CLI, microservices et SDKs automatisés échouent avec un code d'erreur SSL 20.",
      errorMessage:
        "curl: (60) SSL certificate problem: unable to get local issuer certificate\nOpenSSL Error: error:1416F086:SSL routines:tls_process_server_certificate:certificate verify failed",
      triggerConditions:
        "Apparaît immédiatement après le remplacement du fichier .crt lors de la rotation de certificat annuel.",
      rootCause:
        "Le fichier de certificat configuré dans Nginx contenait uniquement le certificat de feuille (leaf certificate) au lieu du bundle complet incluant les certificats intermédiaires (fullchain).",
      secondaryCauses: "L'autorité intermédiaire n'était pas présente dans le truststore local du client.",
      responsibleComponent: "Nginx ssl_certificate bundle",
      triggerFactor: "Copie erronée de cert.pem au lieu de fullchain.pem",
      rootCauseCategory: RootCauseCategory.TLS,
      quickSolution:
        "Concaténer le certificat de domaine avec la chaîne intermédiaire (cat domain.crt intermediate.crt > fullchain.pem), pointer 'ssl_certificate /etc/ssl/fullchain.pem;' dans Nginx et recharger (nginx -s reload).",
      validationTested: true,
      validationEnvironment: "Production Edge Gateway",
      validationResult: "Vérifié avec 'openssl s_client -connect api.domain.com:443 -servername api.domain.com', retour: Verify return code: 0 (ok).",
      hasRegression: false,
    },
  });

  await prisma.tagsOnKnowledgeEntry.createMany({
    data: [
      { entryId: entry2.id, tagId: tagMap["tls"].id },
      { entryId: entry2.id, tagId: tagMap["openssl"].id },
      { entryId: entry2.id, tagId: tagMap["ssl-handshake"].id },
      { entryId: entry2.id, tagId: tagMap["production"].id },
    ],
    skipDuplicates: true,
  });

  await prisma.commandSnippet.createMany({
    data: [
      {
        entryId: entry2.id,
        language: "bash",
        command: "openssl s_client -connect api.example.com:443 -servername api.example.com -showcerts",
        description: "Diagnostiquer la chaîne de certificats renvoyée par le serveur",
        expectedOutput: "Certificate chain\n 0 s:CN = api.example.com\n   i:C = US, O = Let's Encrypt, CN = R3\n 1 s:C = US, O = Let's Encrypt, CN = R3\n   i:C = US, O = Internet Security Research Group, CN = ISRG Root X1\nVerify return code: 0 (ok)",
        tags: JSON.stringify(["openssl", "tls", "debug"]),
      },
      {
        entryId: entry2.id,
        language: "bash",
        command: "cat domain.crt intermediate.crt > /etc/ssl/certs/fullchain.pem\nnginx -t && systemctl reload nginx",
        description: "Assembler le fullchain et recharger Nginx sans coupure",
        tags: JSON.stringify(["nginx", "cert", "bash"]),
      },
    ],
    skipDuplicates: true,
  });

  // Entry 3: Kubernetes Pod CrashLoopBackOff OOMKilled
  const entry3 = await prisma.knowledgeEntry.upsert({
    where: { readableId: "KB-1003" },
    update: {},
    create: {
      readableId: "KB-1003",
      title: "Kubernetes Pod CrashLoopBackOff avec Exit Code 137 (OOMKilled)",
      slug: "kubernetes-pod-crashloopbackoff-exit-code-137-oomkilled",
      status: EntryStatus.VALIDATED,
      confidenceLevel: ConfidenceLevel.VALIDATED,
      authorName: "DevSecOps Engineer",
      isFavorite: false,
      viewCount: 75,
      qualityScore: 90,
      lastTestedAt: new Date("2026-08-10T09:00:00Z"),
      categoryId: categoryMap["conteneurs-k8s"].id,
      environment: "Production",
      technologies: JSON.stringify(["Kubernetes", "Docker", "Java", "cgroups"]),
      tools: JSON.stringify(["kubectl", "cgroups", "JVM"]),
      affectedSystems: JSON.stringify(["k8s-worker-pool", "payment-service"]),
      affectedProjects: JSON.stringify(["Core Banking"]),
      problemDescription:
        "Les pods de l'application payment-service redémarrent en boucle de façon erratique sous forte charge. Le statut du pod passe en CrashLoopBackOff.",
      contextDescription:
        "Cluster Kubernetes v1.28 sur AWS EKS avec des nœuds m5.xlarge. Application Spring Boot 3.",
      symptoms:
        "Latence accrue, pods redémarrant toutes les 5 à 10 minutes. Aucun log d'erreur applicatif ou stacktrace Java dans les logs.",
      errorMessage:
        "Last State: Terminated\nReason: OOMKilled\nExit Code: 137\nStarted: Tue, 10 Aug 2026 08:30:12 +0000\nFinished: Tue, 10 Aug 2026 08:35:45 +0000",
      triggerConditions:
        "Pic de trafic provoquant une allocation de mémoire native non gérée par le heap Java.",
      rootCause:
        "La limite de mémoire du pod (resources.limits.memory: 512Mi) était inférieure à la consommation mémoire totale (MaxDirectMemorySize + JVM Metaspace + Heap Xmx 400m). Le kernel Linux OOM Killer a envoyé un signal SIGKILL (137).",
      secondaryCauses: "Absence de paramétrage explicite de -XX:MaxRAMPercentage sur le conteneur.",
      responsibleComponent: "Kernel cgroups OOM Killer",
      triggerFactor: "Ressources limit configurées trop bas par rapport à la JVM",
      rootCauseCategory: RootCauseCategory.PERFORMANCE,
      quickSolution:
        "Augmenter les limites mémoire à 1Gi dans le Deployment Kubernetes et configurer JAVA_TOOL_OPTIONS='-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0'.",
      validationTested: true,
      validationEnvironment: "Production EKS",
      validationResult: "0 redémarrage constaté sous charge de 10 000 req/sec.",
      hasRegression: false,
    },
  });

  await prisma.tagsOnKnowledgeEntry.createMany({
    data: [
      { entryId: entry3.id, tagId: tagMap["kubernetes"].id },
      { entryId: entry3.id, tagId: tagMap["docker"].id },
      { entryId: entry3.id, tagId: tagMap["production"].id },
    ],
    skipDuplicates: true,
  });

  await prisma.commandSnippet.createMany({
    data: [
      {
        entryId: entry3.id,
        language: "bash",
        command: "kubectl describe pod -l app=payment-service | grep -A 5 'Last State:'",
        description: "Vérifier la raison de terminaison du conteneur (OOMKilled / Exit Code 137)",
        expectedOutput: "Last State: Terminated\n  Reason: OOMKilled\n  Exit Code: 137",
        tags: JSON.stringify(["kubectl", "k8s", "debug"]),
      },
      {
        entryId: entry3.id,
        language: "bash",
        command: "kubectl set resources deployment payment-service --limits=memory=1Gi,cpu=1000m --requests=memory=512Mi,cpu=250m",
        description: "Ajuster à chaud les limites et requêtes de ressources du déploiement",
        tags: JSON.stringify(["kubectl", "resources"]),
      },
    ],
    skipDuplicates: true,
  });

  // Entry Relations
  await prisma.entryRelation.create({
    data: {
      sourceEntryId: entry1.id,
      targetEntryId: entry2.id,
      relationType: RelationType.SIMILAR_CAUSE,
      notes: "Les deux problèmes sont des pannes réseau/sécurité suite à une mise à jour de configuration.",
    },
  }).catch(() => {});

  console.log("Database seeded successfully on Neon!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
