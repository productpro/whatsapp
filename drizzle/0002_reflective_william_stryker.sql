ALTER TABLE `stores` ADD `ownerOpenId` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD CONSTRAINT `stores_ownerOpenId_unique` UNIQUE(`ownerOpenId`);