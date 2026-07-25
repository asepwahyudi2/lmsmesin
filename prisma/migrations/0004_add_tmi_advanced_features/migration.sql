ALTER TABLE `User` ADD COLUMN `phone` VARCHAR(191) NULL;
ALTER TABLE `Logbook` ADD COLUMN `imageUrl` LONGTEXT NULL;
ALTER TABLE `ToolLoan` ADD COLUMN `returnCondition` VARCHAR(191) NULL;

CREATE TABLE `TechnicalDiagram` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `fileUrl` LONGTEXT NOT NULL,
    `fileName` VARCHAR(191) NULL,
    `courseId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `LspUnit` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LspUnit_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `StudentLspStatus` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `unitId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `assessedBy` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StudentLspStatus_studentId_unitId_key`(`studentId`, `unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `TechnicalDiagram` ADD CONSTRAINT `TechnicalDiagram_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `LspUnit` ADD CONSTRAINT `LspUnit_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `StudentLspStatus` ADD CONSTRAINT `StudentLspStatus_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `StudentLspStatus` ADD CONSTRAINT `StudentLspStatus_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `LspUnit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `StudentLspStatus` ADD CONSTRAINT `StudentLspStatus_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
