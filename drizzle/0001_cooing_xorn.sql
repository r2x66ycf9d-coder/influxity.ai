CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`message` text NOT NULL,
	`response` text NOT NULL,
	`requestId` varchar(64),
	`hasError` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`title` varchar(255) NOT NULL,
	`eventDate` timestamp NOT NULL,
	`duration` int NOT NULL,
	`location` varchar(500),
	`attendees` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`contentType` enum('marketing','social','product','email') NOT NULL,
	`prompt` text NOT NULL,
	`content` text NOT NULL,
	`tone` varchar(50),
	`length` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(255),
	`score` int NOT NULL DEFAULT 0,
	`grade` enum('A','B','C','D') NOT NULL DEFAULT 'C',
	`status` enum('hot','warm','cold') NOT NULL DEFAULT 'cold',
	`source` varchar(100),
	`interests` text,
	`aiInsights` text,
	`lastActivity` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transcriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`audioFileKey` varchar(500),
	`transcriptionText` text NOT NULL,
	`duration` int,
	`language` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transcriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generated_content` ADD CONSTRAINT `generated_content_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transcriptions` ADD CONSTRAINT `transcriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;