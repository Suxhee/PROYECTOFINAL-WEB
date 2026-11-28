# Manual: RRHH

<<<<<<< Updated upstream
1. En RRHH → Empleados, registra un empleado ficticio con DUI de formato
   00000000-0, cargo, salario positivo y fecha de ingreso no futura.
2. Edita los datos, busca por nombre o filtra por cargo/estado. La baja lógica
   conserva los registros; confirma antes de dar de baja.
3. En Generar planilla, selecciona año, mes y quincena. Confirma la generación.
   En demo, selecciona un período completo desde la segunda quincena de mayo de 2025.
4. Revisa salario, ISSS, AFP, renta y líquido. Abre una boleta y usa Imprimir.
5. En Historial, consulta la misma planilla. No se permite generar dos veces
   el mismo período en modo simulado.

Pruebas: DUI duplicado, campos inválidos, baja lógica, planilla duplicada,
boleta, historial y modificación de empleado sin alterar la planilla anterior.
Los cálculos simulados no son válidos para pagos reales. Ver docs/caja-rrhh.md.
=======
Registrar y actualizar empleados, seleccionar el período de planilla y consultar
las boletas de pago y el historial. Los cálculos de demostración no son válidos
para pagos reales.
>>>>>>> Stashed changes
