#!/bin/bash
set -e

# -----------------------------
# Script: Docker Registry GC automatique
# -----------------------------

CONFIG_PATH="/opt/registry/config.yml"

echo "=== Recherche du container et volume Docker 'registry' ==="

# 1️⃣ Récupérer le container contenant "registry"
CONTAINER_NAME=$(docker ps -a --format "{{.Names}}" | grep registry || true)
if [ -z "$CONTAINER_NAME" ]; then
  echo "❌ Aucun container contenant 'registry' trouvé. Arrêt."
  exit 1
fi
echo "✅ Container trouvé : $CONTAINER_NAME"

# 1️⃣ Récupérer le volume contenant "registry"
VOLUME_NAME=$(docker volume ls --format "{{.Name}}" | grep registry || true)
if [ -z "$VOLUME_NAME" ]; then
  echo "❌ Aucun volume contenant 'registry' trouvé. Arrêt."
  exit 1
fi
echo "✅ Volume trouvé : $VOLUME_NAME"

# 2️⃣ Copier le config.yml depuis le container si n'existe pas
if [ -f "$CONFIG_PATH" ]; then
  echo "⚠️ Le fichier $CONFIG_PATH existe déjà. On skip la copie et continue."
else
  echo "📦 Copie du config.yml depuis le container..."
  docker cp "$CONTAINER_NAME:/etc/docker/registry/config.yml" "$CONFIG_PATH"
  if [ ! -f "$CONFIG_PATH" ]; then
    echo "❌ Échec de la copie du config.yml. Arrêt."
    exit 1
  fi
  echo "✅ config.yml copié dans $CONFIG_PATH"
fi

# 3️⃣ Arrêter le container
echo "🛑 Arrêt du container $CONTAINER_NAME..."
docker stop "$CONTAINER_NAME"

# 4️⃣ Log de la taille du volume registry avant GC
VOLUME_SIZE_BEFORE=$(docker run --rm -v "$VOLUME_NAME":/data alpine du -sh /data | awk '{print $1}')
echo "💾 Taille du volume registry avant GC : $VOLUME_SIZE_BEFORE"

# 5️⃣ Lancer Garbage Collector réel
echo "🧹 Lancement du Garbage Collector réel..."
docker run --rm \
  -v "$VOLUME_NAME":/var/lib/registry \
  -v "$CONFIG_PATH":/etc/docker/registry/config.yml:ro \
  registry:2 garbage-collect /etc/docker/registry/config.yml

# 6️⃣ Log de la taille du volume registry après GC
VOLUME_SIZE_AFTER=$(docker run --rm -v "$VOLUME_NAME":/data alpine du -sh /data | awk '{print $1}')
echo "💾 Taille du volume registry après GC : $VOLUME_SIZE_AFTER"

# 7️⃣ Redémarrer le container
echo "🚀 Redémarrage du container $CONTAINER_NAME..."
docker start "$CONTAINER_NAME"
echo "✅ Container $CONTAINER_NAME redémarré avec succès."

echo "✅ Garbage Collector terminé avec succès."
