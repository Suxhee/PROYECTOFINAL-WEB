const env = require('./src/config/env');  // *D*
const app = require('./src/app');
const { sequelize } = require('./src/models');// *S*

const PORT = env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✔ Se ha conectado a la base de datos exitosamente');


    await sequelize.sync();
    console.log('✔ Los modelos se han sincronizado');

    const server = app.listen(PORT, () => {
      console.log(`✔ API Origenes SV en http://localhost:${PORT}`);
    });

    // Cierre
    const shutdown = (signal) => {
      console.log(`\n${signal} recibido, cerrando servidor...`);
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('✖ No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('Promesa rechazada sin manejar:', reason);
});

start();
