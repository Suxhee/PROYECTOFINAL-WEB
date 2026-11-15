# Arquitectura técnica

Frontend SPA separado del backend Express. En desarrollo, Vite proxifica `/api`;
en producción se recomienda publicar frontend y API detrás de Nginx con TLS.
El navegador usa `VITE_API_URL`, que no debe contener secretos. El backend
valida configuración al iniciar y centraliza acceso SQL Server por Sequelize.
Los mocks son demostrativos y no sustituyen persistencia ni autorización.
