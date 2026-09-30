# Automated CI/CD Pipeline on AWS EKS

An end-to-end Automated CI/CD pipeline for deploying a React.js application on Amazon EKS, integrating Jenkins, SonarQube, Trivy, Docker, and Argo CD for automated build, security scanning, containerization, and GitOps-based continuous delivery.

---

# 🏗️ Architecture & Project Structure

![Architecture Diagram](screenshots/diagram.png)

# 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Application | React.js |
| CI/CD | Jenkins |
| Code Quality | SonarQube |
| Security Scanning | Trivy |
| Containerization | Docker |
| Container Registry | Docker Hub |
| Orchestration | Kubernetes, Amazon EKS |
| GitOps | Argo CD |
| Cloud | AWS (EC2, EKS, VPC) |
| OS | Ubuntu Server Pro 24.04 LTS (HVM) |

---

# ✨ Features

- Automated CI/CD pipeline triggered on every push to **main**
- Static code analysis with SonarQube
- SonarQube Quality Gate integrated into the Jenkins pipeline
- Trivy filesystem and Docker image vulnerability scanning
- Docker image automatically tagged with the Jenkins build number
- Docker image pushed to Docker Hub
- GitOps-based deployment using Argo CD
- Kubernetes deployment on Amazon EKS with two replicas
- Kubernetes LoadBalancer service for public application access
- Automated Kubernetes manifest update with the new Docker image tag

---

# 🔒 Security Groups

| SG Name | Inbound Rules |
|---------|--------------|
| Boom | Port 22 (SSH), Port 8080 (Jenkins), Port 9000 (SonarQube), Port 80 (HTTP), Port 443 (HTTPS) |

---

# 🚀 Deployment Steps

## Prerequisites

- EC2 Key Pair
- GitHub Account with Personal Access Token
- DockerHub Account with Read/Write Token

---

## 1️⃣ Launch AWS EC2 Instance

- AMI: Ubuntu Server Pro 24.04 LTS (HVM)
- Instance Type: c7i-flex.large
- Storage: 30 GB
- Open Security Group ports: 22, 8080, 9000, 443, 80

---

## 2️⃣ Install Java 21

```bash
sudo apt update
sudo apt install fontconfig openjdk-21-jre -y
java -version
```

---

## 3️⃣ Install Jenkins 

```bash
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install jenkins -y
systemctl start jenkins
systemctl enable jenkins
systemctl status jenkins
```

Get admin password:

```bash
cat /var/lib/jenkins/secrets/initialAdminPassword
```

Access Jenkins: `http://<EC2-PUBLIC-IP>:8080`

---

## 4️⃣ Install Docker

```bash
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
sudo usermod -aG docker jenkins
sudo chmod 777 /var/run/docker.sock
```

---

## 5️⃣ Install SonarQube

```bash
docker run -d --name sonar -p 9000:9000 sonarqube:lts-community
```

Access SonarQube: `http://<EC2-PUBLIC-IP>:9000`
- Default login: `admin / admin`
- Go to **My Account → Security → Generate Token** → copy token

---

## 6️⃣ Install Trivy

```bash
sudo apt-get install wget gnupg
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
```

---

## 7️⃣ Configure Jenkins

### Plugins to Install
- Stage View
- NodeJS
- SonarQube Scanner
- Docker & Docker Pipeline
- CloudBees Docker Build and Publish
- Eclipse Temurin Installer

### Tools (Manage Jenkins → Tools)

| Tool | Name |
|------|------|
| JDK 17 | `jdk17` |
| NodeJS 18 | `node18` |
| SonarQube Scanner | `sonar-scanner` |
| Docker | `docker` |

### Credentials (Manage Jenkins → Credentials → Global)

| ID | Kind | Purpose |
|----|------|---------|
| `docker-cred` | Username & Password | DockerHub Read/Write Token |
| `git-cred` | Username & Password | GitHub Personal Access Token |
| `sonar-token` | Secret Text | SonarQube Token |

### SonarQube Server (Manage Jenkins → System)
- Name: `sonar-server`
- URL: `http://<EC2-IP>:9000`
- Token: `sonar-token`

### SonarQube Webhook
- Go to SonarQube → **Administration → Webhooks → Create**
- Name: `jenkins`
- URL: `http://<EC2-IP>:8080/sonarqube-webhook/`

---

## 8️⃣ Clone Repo & Configure Pipeline

```bash
git clone https://github.com/Heyysri/Ci-Cd-Pipeline-Security-Scanning.git
```

```bash
⚠️ Before running the pipeline, update the following:

Jenkinsfile → replace Docker-Hub-Username, Git-Username, Git-Email
k8s/deployment.yml → replace Docker-Hub-Username
```


In Jenkins:
- New Item → Pipeline
- Pipeline script from SCM → Git
- Repo URL: `https://github.com/Heyysri/Ci-Cd-Pipeline-Security-Scanning.git`
- Branch: `main`
- Script Path: `Jenkinsfile`
- Click **Build Now**

### Pipeline Stages

```
✅Declarative: Tool Install
✅Clean Workspace
✅Checkout Code
✅SonarQube Analysis
✅Quality Gate
✅Install Dependencies
✅Trivy Filesystem Scan
✅Build Docker Image
✅Trivy Docker Image Scan
✅Push Docker Image
✅Update Kubernetes Manifest
✅Declarative: Post Actions
```

---

## 9️⃣ Create AWS EKS Cluster 
Run the following from your EC2 instance or AWS CloudShell:

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
chmod +x kubectl
mkdir -p ~/.local/bin
mv ./kubectl ~/.local/bin/kubectl
kubectl version --client

# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
eksctl version

# Install AWS CLI
sudo apt install unzip -y
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure

# Create cluster using eksctl
eksctl create cluster \
  --name eks-devsecops \
  --region ap-south-1 \
  --version 1.31 \
  --nodegroup-name linux-nodes \
  --node-type c7i-flex.large  \
  --nodes 2

# Log in to Cluster
aws eks update-kubeconfig --name eks-devsecops

# Delete EKS Cluster
eksctl delete cluster --name eks-devsecops --region ap-south-1

```

---

## 🔟 Install & Configure Argo CD

```bash
# Create namespace
kubectl create namespace argocd

# Install Argo CD
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods
kubectl get pods -n argocd

# Expose UI
kubectl patch svc argocd-server -n argocd \
  -p '{"spec": {"type": "LoadBalancer"}}'

# Get external IP
kubectl get svc -n argocd

# Get admin password
kubectl get secret argocd-initial-admin-secret \
  -n argocd \
  -o jsonpath="{.data.password}" | base64 -d
```

Access Argo CD: `http://<ARGOCD-EXTERNAL-IP>`

### Argo CD Application Config

| Field | Value |
|-------|-------|
| App Name | `devsecops-app` |
| Project | `default` |
| Sync Policy | Automatic |
| Repo URL | `https://github.com/Heyysri/Ci-Cd-Pipeline-Security-Scanning.git` |
| Path | `k8s` |
| Cluster | `https://kubernetes.default.svc` |
| Namespace | `default` |

### Verify Deployment

```bash
kubectl get pods
kubectl get svc
```

Access app: `http://<EXTERNAL-IP>` ✅

---

# 📸 Screenshots

## EC2 Instance
![Ec2 Instance](screenshots/Ec2-Instance.png)

## Security Group
![Security-Group](screenshots/Security-group.png)

## Jenkins Pipeline Success
![Pipeline Success](screenshots/Pipeline-success.png)

## Jenkins Console logs Success
![Logs Success](screenshots/Logs-success.png)

## SonarQube Quality Gate Passed
![Quality Gate](screenshots/Quality-gate.png)

## DockerHub Image Pushed
![Image Push](screenshots/Image-Push.png)

## Argo CD Synced & Healthy
![Argo-CD](screenshots/argo-cd.png)

## Live Application
![Live Application](screenshots/Live-application.png)

---

# 📂 Project Structure

```text
Ci-Cd-Pipeline-Security-Scanning/
├── src/
├── public/
├── k8s/
├── screenshots/
├── Dockerfile
├── Jenkinsfile
├── sonar-project.properties
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
```

---

# 🔮 Future Improvements

- Add Datadog monitoring on EKS
- Configure Terraform for full infrastructure provisioning
- Enable HTTPS using AWS ACM + Load Balancer
- Add email/Slack notifications on pipeline failure
- Implement Blue-Green or Canary deployment strategy
- Add Kubernetes HPA for auto-scaling
- Integrate OWASP Dependency Check for SCA


---

# 👤 Author

## Srikanth Sanjay Pawar

- LinkedIn: https://linkedin.com/in/srikanth-pawar
- GitHub: https://github.com/Heyysri
- Email: sreekanthsanjay5@gmail.com

---


# ⭐ Project Highlights

- End-to-end Automated CI/CD workflow from source code to Kubernetes deployment
- Automated code quality analysis using SonarQube
- Security scanning using Trivy for filesystem and Docker image vulnerabilities
- GitOps-based continuous delivery using Argo CD
- Application deployed on Amazon EKS using Kubernetes Deployments and LoadBalancer service
- Docker image versioning using Jenkins build numbers
- Automated Kubernetes manifest updates to trigger Argo CD synchronization
- Integrated AWS, Jenkins, Docker, Kubernetes, SonarQube, Trivy, and Argo CD workflow
