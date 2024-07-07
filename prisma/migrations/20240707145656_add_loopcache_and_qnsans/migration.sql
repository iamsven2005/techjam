-- CreateTable
CREATE TABLE `authors` (
    `id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `gender` BOOLEAN NULL,
    `birth_year` SMALLINT NULL,
    `death_year` SMALLINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_authors` (
    `book_id` BIGINT NOT NULL,
    `author_id` BIGINT NOT NULL,

    PRIMARY KEY (`book_id`, `author_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `books` (
    `id` BIGINT NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `type` ENUM('Magazine', 'Novel', 'Life', 'Arts', 'Comics', 'Education & Reference', 'Humanities & Social Sciences', 'Science & Technology', 'Kids', 'Sports') NOT NULL,
    `published_at` DATETIME(0) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `price` DECIMAL(15, 2) NOT NULL DEFAULT 0.0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `book_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `quality` TINYINT NOT NULL,
    `ordered_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `orders_book_id_idx`(`book_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ratings` (
    `book_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `score` TINYINT NOT NULL,
    `rated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uniq_book_user_idx`(`book_id`, `user_id`),
    PRIMARY KEY (`book_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL,
    `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.0,
    `nickname` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `nickname`(`nickname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoopCache` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QnsAns` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `qns` VARCHAR(191) NOT NULL,
    `ans` VARCHAR(191) NOT NULL,
    `loopCacheId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
