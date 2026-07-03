

set -e

FRONTEND_PORT="${PORT:-3000}"

BACKEND_PORT="8000"

echo "🚀 Iniciando backend FastAPI en puerto $BACKEND_PORT..."
cd /app/backend
python3 -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "$BACKEND_PORT" \
    --workers 2 &

BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"

echo "⏳ Esperando al backend..."
for i in $(seq 1 30); do
    if curl -sf "http://localhost:$BACKEND_PORT/health" > /dev/null 2>&1 || \
       curl -sf "http://localhost:$BACKEND_PORT/" > /dev/null 2>&1; then
        echo "✅ Backend listo"
        break
    fi
    sleep 1
done

echo "🚀 Iniciando frontend SvelteKit en puerto $FRONTEND_PORT..."
cd /app/frontend
PORT="$FRONTEND_PORT" node build &

FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Habtub corriendo:"
echo "   Frontend → http://0.0.0.0:$FRONTEND_PORT"
echo "   Backend  → http://localhost:$BACKEND_PORT (interno)"

wait -n $BACKEND_PID $FRONTEND_PID
EXIT_CODE=$?

echo "⚠️  Un proceso terminó (exit code: $EXIT_CODE). Apagando..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
exit $EXIT_CODE
