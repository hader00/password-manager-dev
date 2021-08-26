drop database if exists `passwordManagerDB`;
create database `passwordManagerDB`;
drop user if exists 'xhader00'@'localhost';
CREATE USER 'xhader00'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL ON passwordManagerDB.* TO 'xhader00'@localhost;
use `passwordManagerDB`;

drop table if exists Users;
drop table if exists Passwords;

create table Users(
    UserID       int auto_increment,
	FirstName    TEXT not null,
    LastName    TEXT not null,
    Email        TEXT not null,
    Password     TEXT not null,

    primary key (UserID)
);

CREATE TABLE Passwords(
    PasswordID INTEGER auto_increment,
    Title TEXT NOT NULL,
    Description TEXT,
    Url TEXT,
    Username TEXT NOT NULL,
    Password TEXT NOT NULL,
    UserID int not null,

    foreign key (UserID) REFERENCES Users (UserID) on delete cascade,

    primary key (passwordID)
);


INSERT INTO Users (FirstName, LastName, Email, Password)
VALUES ('Martin', 'Haderka', 'm.h@mh.cz', 'MainHeslo1234');

INSERT INTO Passwords (Title, Description, Url, Username, Password, UserID)
VALUES ('Google', 'Google Account', 'www.google.com', 'my.name@gmail.com', 'Pa$$12', 1);