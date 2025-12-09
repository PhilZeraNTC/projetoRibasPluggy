-- CreateTable
CREATE TABLE "AnaliseFinanceira" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,
    "renda" REAL NOT NULL,
    "gastos" REAL NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
