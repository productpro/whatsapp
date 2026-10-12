CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(80) NOT NULL,
	`price` int NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`imageUrl` text,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(160) NOT NULL,
	`tagline` text NOT NULL,
	`whatsappNumber` varchar(32) NOT NULL,
	`location` varchar(160) NOT NULL,
	`accentColor` varchar(20) NOT NULL DEFAULT '#1d4ed8',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`),
	CONSTRAINT `stores_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_storeId_stores_id_fk` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE no action ON UPDATE no action;