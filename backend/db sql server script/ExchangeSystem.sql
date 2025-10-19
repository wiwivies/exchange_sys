
-- ===============================================
-- ExchangeSystem - повна оптимізована версія (SQL Server)
-- Створено: для обмінного пункту (повна логіка обміну валют)
-- ===============================================

-- 0. БАЗА
IF DB_ID('ExchangeSystem') IS NOT NULL
    DROP DATABASE ExchangeSystem;
GO

CREATE DATABASE ExchangeSystem;
GO
USE ExchangeSystem;
GO

-- 1. ПУНКТИ ОБМІНУ
CREATE TABLE ExchangePoints (
    PointID   INT IDENTITY(1,1) PRIMARY KEY,
    PointName NVARCHAR(100) NOT NULL,
    Adress    NVARCHAR(255) NOT NULL,
    City      NVARCHAR(100) NOT NULL,
    Phone     NVARCHAR(20) NOT NULL
);
GO

-- 2. USERS (адмін/касир)
CREATE TABLE Users (
    UserID    INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName  NVARCHAR(50) NOT NULL,
    Login_name NVARCHAR(50) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    Phone NVARCHAR(20) NULL,
    Rolle NVARCHAR(20) CHECK (Rolle IN ('admin','cashier')) NOT NULL,
    JoinDate DATE NULL,            -- дата прийняття
    PointID INT NOT NULL,
    FOREIGN KEY (PointID) REFERENCES ExchangePoints(PointID) ON DELETE CASCADE
);
GO
CREATE INDEX idx_Users_Login ON Users(Login_name);
CREATE INDEX idx_Users_Point ON Users(PointID);
GO

-- 3. CLIENTS
CREATE TABLE Clients (
    ClientID INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    PassportNumber NVARCHAR(20) UNIQUE NOT NULL,
    DateOfBirth DATE NOT NULL,
    Phone NVARCHAR(20) NULL,
    Email NVARCHAR(100) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT chk_age CHECK (DATEDIFF(YEAR, DateOfBirth, GETDATE()) >= 18)
);
GO
CREATE INDEX idx_Clients_Passport ON Clients(PassportNumber);
GO

-- 4. CURRENCIES (усі курси відносно UAH)
CREATE TABLE Currencies (
    CurrencyID   INT IDENTITY(1,1) PRIMARY KEY,
    CurrencyName NVARCHAR(50) NOT NULL,
    CurrencyCode NVARCHAR(10) UNIQUE NOT NULL,
    BuyRate      DECIMAL(10,4) NOT NULL,  -- обмінник купує у клієнта (UAH за 1 одиницю)
    SellRate     DECIMAL(10,4) NOT NULL,  -- обмінник продає клієнту (UAH за 1 одиницю)
    UpdatedAt    DATETIME DEFAULT GETDATE(),
	CONSTRAINT chk_rates_positive CHECK (BuyRate > 0 AND SellRate > 0)
);
GO

CREATE INDEX idx_Currencies_Code ON Currencies(CurrencyCode);
GO

USE ExchangeSystem;
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Currencies';

UPDATE Currencies
SET 
    BuyRate = BuyRate + 0.10,
    SellRate = SellRate + 0.10,
    UpdatedAt = GETDATE()
WHERE CurrencyCode = 'EUR';

-- 5. ExchangePairs - дозволені напрямки обміну (без автоматичної дзеркалізації)
CREATE TABLE ExchangePairs (
    PairID INT IDENTITY(1,1) PRIMARY KEY,
    FromCurrencyID INT NOT NULL,
    ToCurrencyID INT NOT NULL,
    IsAllowed BIT DEFAULT 1,
    CONSTRAINT uq_ExchangePair UNIQUE (FromCurrencyID, ToCurrencyID),
    FOREIGN KEY (FromCurrencyID) REFERENCES Currencies(CurrencyID) ON DELETE NO ACTION,
    FOREIGN KEY (ToCurrencyID)   REFERENCES Currencies(CurrencyID) ON DELETE NO ACTION
);
GO
CREATE INDEX idx_ExchangePairs_FromTo ON ExchangePairs(FromCurrencyID, ToCurrencyID);
GO

-- 6. BALANCES (скільки у пункті кожної валюти)
CREATE TABLE Balances (
    BalanceID INT IDENTITY(1,1) PRIMARY KEY,
    PointID   INT NOT NULL,
    CurrencyID INT NOT NULL,
    Amount DECIMAL(20,4) NOT NULL DEFAULT 0,
    LastUpdated DATETIME DEFAULT GETDATE(),
    CONSTRAINT uq_Point_Currency UNIQUE (PointID, CurrencyID),
    FOREIGN KEY (PointID) REFERENCES ExchangePoints(PointID) ON DELETE CASCADE,
    FOREIGN KEY (CurrencyID) REFERENCES Currencies(CurrencyID) ON DELETE NO ACTION
);
GO
CREATE INDEX idx_Balances_PointCurrency ON Balances(PointID, CurrencyID);
GO

-- 7. Currency history (лог змін курсів)
CREATE TABLE CurrencyHistory (
    HistoryID INT IDENTITY(1,1) PRIMARY KEY,
    CurrencyID INT NOT NULL,
    AdminID INT NULL,
    OldBuyRate DECIMAL(18,6),
    OldSellRate DECIMAL(18,6),
    NewBuyRate DECIMAL(18,6),
    NewSellRate DECIMAL(18,6),
    ChangeDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CurrencyID) REFERENCES Currencies(CurrencyID) ON DELETE NO ACTION,
    FOREIGN KEY (AdminID) REFERENCES Users(UserID) ON DELETE SET NULL
);
GO

-- 8. REPORTS
CREATE TABLE Reports (
    ReportID INT IDENTITY(1,1) PRIMARY KEY,
    AdminID INT NOT NULL,
    ReportDate DATETIME DEFAULT GETDATE(),
    ReportType NVARCHAR(20) CHECK (ReportType IN ('daily','monthly','custom')) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    FilePath NVARCHAR(255) NULL,
    FOREIGN KEY (AdminID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

-- 9. OPERATIONS (операції: buy/sell/exchange) 
-- FromCurrencyID -> валюта, яку віддає клієнт
-- ToCurrencyID   -> валюта, яку отримує клієнт
CREATE TABLE Operations (
    OperationID INT IDENTITY(1,1) PRIMARY KEY,
    ClientID INT NOT NULL,
    CashierID INT NULL,
    PointID INT NOT NULL, -- пункт де операція виконана
    FromCurrencyID INT NOT NULL,
    ToCurrencyID INT NOT NULL,
    AmountFrom DECIMAL(20,4) NOT NULL,   -- скільки віддає клієнт (в одиницях FromCurrency)
    AmountTo   DECIMAL(20,4) NOT NULL,   -- скільки отримує клієнт (в одиницях ToCurrency)
    RateFrom   DECIMAL(18,6) NOT NULL,   -- BuyRate(From) при моменті операції
    RateTo     DECIMAL(18,6) NOT NULL,   -- SellRate(To) при моменті операції
    TotalUAH   DECIMAL(20,4) NOT NULL,   -- гривневий еквівалент (AmountFrom * RateFrom)
    OperationDate DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Operations_Clients FOREIGN KEY (ClientID)
        REFERENCES Clients(ClientID) ON DELETE NO ACTION,

    CONSTRAINT FK_Operations_Users FOREIGN KEY (CashierID)
        REFERENCES Users(UserID) ON DELETE SET NULL,

    CONSTRAINT FK_Operations_Points FOREIGN KEY (PointID)
        REFERENCES ExchangePoints(PointID) ON DELETE NO ACTION,

    CONSTRAINT FK_Operations_FromCurrency FOREIGN KEY (FromCurrencyID)
        REFERENCES Currencies(CurrencyID) ON DELETE NO ACTION,

    CONSTRAINT FK_Operations_ToCurrency FOREIGN KEY (ToCurrencyID)
        REFERENCES Currencies(CurrencyID) ON DELETE NO ACTION
);
GO

CREATE INDEX idx_Operations_PointDate ON Operations(PointID, OperationDate);
CREATE INDEX idx_Operations_Client ON Operations(ClientID);
GO


-- ТРИГЕР: оновлення UpdatedAt і запис в CurrencyHistory
CREATE TRIGGER trg_UpdateCurrencyTimeAndHistory
ON Currencies
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Оновлення UpdatedAt
    UPDATE c
    SET UpdatedAt = GETDATE()
    FROM Currencies c
    INNER JOIN inserted i ON c.CurrencyID = i.CurrencyID;

    -- Лог в CurrencyHistory (тільки якщо змінились курси)
    INSERT INTO CurrencyHistory (CurrencyID, OldBuyRate, OldSellRate, NewBuyRate, NewSellRate, ChangeDate)
    SELECT 
        d.CurrencyID,
        d.BuyRate, d.SellRate,
        i.BuyRate, i.SellRate,
        GETDATE()
    FROM inserted i
    JOIN deleted d ON i.CurrencyID = d.CurrencyID
    WHERE ISNULL(d.BuyRate,0) <> ISNULL(i.BuyRate,0) OR ISNULL(d.SellRate,0) <> ISNULL(i.SellRate,0);
END;
GO

-- ЗБЕРЕЖЕНА ПРОЦЕДУРА: виконати обмін (централізована логіка)
-- Параметри:
--  @ClientID, @CashierID, @PointID, @FromCode, @ToCode, @AmountFrom
-- Повертає: помилка при недопустимій парі або недостатніх залишках

ALTER PROCEDURE sp_PerformExchange
    @ClientID INT,
    @CashierID INT,
    @PointID INT,
    @FromCode NVARCHAR(10),
    @ToCode NVARCHAR(10),
    @AmountFrom DECIMAL(20,6)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        DECLARE 
            @FromCurrencyID INT,
            @ToCurrencyID   INT,
            @BuyFrom DECIMAL(18,6),
            @SellFrom DECIMAL(18,6),
            @BuyTo DECIMAL(18,6),
            @SellTo DECIMAL(18,6),
            @AmountTo DECIMAL(20,6),
            @TotalUAH DECIMAL(20,6),
            @Now DATETIME = GETDATE();

        -- 1) Отримати CurrencyID та курси з таблиці Currencies
        SELECT @FromCurrencyID = CurrencyID, @BuyFrom = BuyRate, @SellFrom = SellRate
        FROM Currencies
        WHERE CurrencyCode = @FromCode;

        SELECT @ToCurrencyID = CurrencyID, @BuyTo = BuyRate, @SellTo = SellRate
        FROM Currencies
        WHERE CurrencyCode = @ToCode;

        IF @FromCurrencyID IS NULL OR @ToCurrencyID IS NULL
        BEGIN
            RAISERROR('Не знайдено одну з валют (From або To).', 16, 1);
            ROLLBACK TRAN;
            RETURN;
        END

        -- 2) Перевірити, чи пара дозволена в ExchangePairs
        IF NOT EXISTS (
            SELECT 1 FROM ExchangePairs ep
            WHERE ep.FromCurrencyID = @FromCurrencyID AND ep.ToCurrencyID = @ToCurrencyID AND ISNULL(ep.IsAllowed,0) = 1
        )
        BEGIN
            RAISERROR('Пара обміну не дозволена.', 16, 1);
            ROLLBACK TRAN;
            RETURN;
        END

        -- 3) Перевірити наявність курсів
        IF @BuyFrom IS NULL OR @SellTo IS NULL
        BEGIN
            RAISERROR('Не знайдено курси валют для обміну.', 16, 1);
            ROLLBACK TRAN;
            RETURN;
        END

        -- 4) Обчислення AmountTo і TotalUAH
        IF @FromCode = 'UAH'
        BEGIN
            -- Клієнт віддає UAH, отримує іншу валюту (купує валюту)
            -- AmountTo = AmountFrom / SellRate(To)
            SET @AmountTo = ROUND(@AmountFrom / @SellTo, 4);
            SET @TotalUAH = ROUND(@AmountFrom, 2);
        END
        ELSE IF @ToCode = 'UAH'
        BEGIN
            -- Клієнт віддає валюту, отримує UAH (продає валюту)
            -- AmountTo = AmountFrom * BuyRate(From)  (отримує гривні)
            SET @AmountTo = ROUND(@AmountFrom * @BuyFrom, 4);
            SET @TotalUAH = ROUND(@AmountTo, 2);
        END
        ELSE
        BEGIN
            -- Крос-курс: використаємо Buy(From) і Sell(To) як у вашій логіці
            SET @AmountTo = ROUND(@AmountFrom * @BuyFrom / @SellTo, 4);
            SET @TotalUAH = ROUND(@AmountFrom * @BuyFrom, 2);
        END

        -- 5) Оновити залишки в таблиці Balances
        -- Зменшити баланс валюти, яку віддає клієнт
        UPDATE Balances
        SET Amount = Amount - @AmountFrom, LastUpdated = @Now
        WHERE PointID = @PointID AND CurrencyID = @FromCurrencyID;

        IF @@ROWCOUNT = 0
        BEGIN
            -- Можливо запису не було — вставимо або помилка (тут — помилка)
            RAISERROR('Баланс для FromCurrency на цьому пункті не знайдено.', 16, 1);
            ROLLBACK TRAN;
            RETURN;
        END

        -- Збільшити баланс валюти, яку отримує клієнт
        UPDATE Balances
        SET Amount = Amount + @AmountTo, LastUpdated = @Now
        WHERE PointID = @PointID AND CurrencyID = @ToCurrencyID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('Баланс для ToCurrency на цьому пункті не знайдено.', 16, 1);
            ROLLBACK TRAN;
            RETURN;
        END

        -- 6) Записати операцію в таблицю Operations (використовуємо ID валют)
        INSERT INTO Operations
            (ClientID, CashierID, PointID, FromCurrencyID, ToCurrencyID, AmountFrom, AmountTo, RateFrom, RateTo, TotalUAH, OperationDate)
        VALUES
            (@ClientID, @CashierID, @PointID, @FromCurrencyID, @ToCurrencyID, @AmountFrom, @AmountTo, @BuyFrom, @SellTo, @TotalUAH, @Now);

        -- 7) Коміт і повернення результату
        COMMIT TRAN;

        SELECT 
            SCOPE_IDENTITY() AS OperationID,
            @AmountTo AS AmountTo,
            @TotalUAH AS TotalUAH,
            @Now AS OperationDate;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRAN;

        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrNum INT = ERROR_NUMBER();
        RAISERROR('Помилка виконання sp_PerformExchange: %s', 16, 1, @ErrMsg);
        RETURN;
    END CATCH
END;
GO

DECLARE @client INT = (SELECT TOP 1 ClientID FROM Clients);
DECLARE @cashier INT = (SELECT TOP 1 UserID FROM Users WHERE Rolle = 'cashier');
DECLARE @point INT = (SELECT TOP 1 PointID FROM ExchangePoints);

EXEC sp_PerformExchange 
    @ClientID = @client, 
    @CashierID = @cashier, 
    @PointID = @point, 
    @FromCode = N'USD', 
    @ToCode = N'UAH', 
    @AmountFrom = 10;

DECLARE @client INT = (SELECT TOP 1 ClientID FROM Clients);
DECLARE @cashier INT = (SELECT TOP 1 UserID FROM Users WHERE Rolle = 'cashier');
DECLARE @point INT = (SELECT TOP 1 PointID FROM ExchangePoints);

EXEC sp_PerformExchange 
    @ClientID = @client, 
    @CashierID = @cashier, 
    @PointID = @point, 
    @FromCode = N'UAH', 
    @ToCode = N'USD', 
    @AmountFrom = 100;


-- TRIGGER: при вставці в Operations — захист (перевірка allowed pair)
-- Це додатковий захист, якщо хтось намагатиметься вставити операцію напряму.
DROP TRIGGER IF EXISTS trg_ValidateOperationInsert;
GO

CREATE TRIGGER trg_ValidateOperationInsert
ON Operations
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        LEFT JOIN ExchangePairs ep 
            ON i.FromCurrencyID = ep.FromCurrencyID AND i.ToCurrencyID = ep.ToCurrencyID
        WHERE ep.IsAllowed <> 1 OR ep.PairID IS NULL
    )
    BEGIN
        RAISERROR('Inserted operation has an unallowed currency pair.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- VIEW: вивід всіх дозволених крос-курсів (динамічно обчислюються)
CREATE OR ALTER VIEW v_ExchangeRates AS
SELECT 
    ep.PairID,
    cf.CurrencyCode AS FromCurrency,
    ct.CurrencyCode AS ToCurrency,
    CASE 
        WHEN cf.CurrencyCode = 'UAH' THEN ct.SellRate       -- UAH -> XXX: курс = BuyRate(XXX) (скільки UAH дає 1 XXX при купівлі?)
        WHEN ct.CurrencyCode = 'UAH' THEN cf.BuyRate     -- XXX -> UAH: курс = SellRate(XXX) (скільки UAH отримуєш за 1 XXX при продажу?)
        ELSE ROUND(cf.SellRate / ct.BuyRate, 6)            -- Cross rate: використовую Sell(from) / Buy(to)
    END AS Rate,
    CASE 
        WHEN cf.CurrencyCode = 'UAH' THEN 'UAH->CUR'
        WHEN ct.CurrencyCode = 'UAH' THEN 'CUR->UAH'
        ELSE 'CUR->CUR'
    END AS RateType
FROM ExchangePairs ep
JOIN Currencies cf ON ep.FromCurrencyID = cf.CurrencyID
JOIN Currencies ct ON ep.ToCurrencyID = ct.CurrencyID
WHERE ep.IsAllowed = 1;
GO

-- VIEW: зручний перегляд операцій
CREATE OR ALTER VIEW v_OperationsInfo AS
SELECT
    o.OperationID,
	o.CashierID,
    c.FirstName + ' ' + c.LastName AS ClientName,
    ISNULL(u.FirstName + ' ' + u.LastName, N'—') AS CashierName,
    ep.PointName,
    cf.CurrencyCode AS FromCurrency,
    ct.CurrencyCode AS ToCurrency,
    o.AmountFrom,
    o.AmountTo,
    o.RateFrom,
    o.RateTo,
    o.TotalUAH,
    o.OperationDate
FROM Operations o
JOIN Clients c ON o.ClientID = c.ClientID
LEFT JOIN Users u ON o.CashierID = u.UserID
JOIN ExchangePoints ep ON o.PointID = ep.PointID
JOIN Currencies cf ON o.FromCurrencyID = cf.CurrencyID
JOIN Currencies ct ON o.ToCurrencyID = ct.CurrencyID;
GO

CREATE TRIGGER trg_HashPassword_OnInsert
ON Users
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Users (FirstName, LastName, Login_name, PasswordHash, Email, Phone, Rolle, JoinDate, PointID)
    SELECT
        i.FirstName,
        i.LastName,
        i.Login_name,
        CONVERT(NVARCHAR(255), HASHBYTES('SHA2_512', i.PasswordHash), 2), -- тут хешування
        i.Email,
        i.Phone,
        i.Rolle,
        i.JoinDate,
        i.PointID
    FROM inserted i;
END;
GO

-- ПОЧАТКОВІ ДАНІ (по 3 записи в основні таблиці) — вставки із SELECT
-- ExchangePoints
INSERT INTO ExchangePoints (PointName, Adress, City, Phone) VALUES
(N'Exchange Center №1', N'вул. Хрещатик, 15', N'Київ', N'+380441111111'),
(N'EuroChange', N'просп. Свободи, 22', N'Львів', N'+380322222222'),
(N'BestRate', N'вул. Дерибасівська, 8', N'Одеса', N'+380482333333');
GO

-- Users (адмін + 2 касири)
INSERT INTO Users (FirstName, LastName, Login_name, PasswordHash, Email, Phone, Rolle, JoinDate, PointID)
VALUES
(N'Вікторія', N'Бережна', N'vberezhna', N'hash1', N'viktoria@ex.ua', N'+380501111111', N'admin', '2023-01-10', (SELECT PointID FROM ExchangePoints WHERE PointName = N'Exchange Center №1')),
(N'Андрій', N'Коваленко', N'akoval', N'hash2', N'andrii@ex.ua', N'+380671112233', N'cashier', '2023-03-01', (SELECT PointID FROM ExchangePoints WHERE PointName = N'EuroChange')),
(N'Олена', N'Сидоренко', N'osyd', N'hash3', N'olena@ex.ua', N'+380931223344', N'cashier', '2023-04-12', (SELECT PointID FROM ExchangePoints WHERE PointName = N'BestRate'));
GO

-- Clients
INSERT INTO Clients (FirstName, LastName, PassportNumber, DateOfBirth, Phone, Email)
VALUES
(N'Іван', N'Петренко', N'AA123456', '1990-05-15', N'+380931111111', N'ivan@example.com'),
(N'Марія', N'Кравченко', N'AB654321', '1985-11-20', N'+380961222333', N'maria@example.com'),
(N'Олег', N'Ткаченко', N'AC777888', '1998-03-12', N'+380991444555', N'oleg@example.com');
GO

-- Currencies (додаємо UAH як базову валюту)
INSERT INTO Currencies (CurrencyName, CurrencyCode, BuyRate, SellRate)
VALUES
(N'Гривня', N'UAH', 1.000000, 1.000000),
(N'Долар США', N'USD', 39.250000, 39.700000),
(N'Євро', N'EUR', 41.100000, 41.650000),
(N'Фунт стерлінгів', N'GBP', 48.500000, 49.200000);
GO

-- ExchangePairs: дозволені напрями (приклад — вводяться у обидва боки вручну, якщо потрібно)
INSERT INTO ExchangePairs (FromCurrencyID, ToCurrencyID)
SELECT (SELECT CurrencyID FROM Currencies WHERE CurrencyCode = 'UAH'),
       (SELECT CurrencyID FROM Currencies WHERE CurrencyCode = 'USD')
UNION ALL
SELECT (SELECT CurrencyID FROM Currencies WHERE CurrencyCode = 'USD'),
       (SELECT CurrencyID FROM Currencies WHERE CurrencyCode = 'UAH')
UNION ALL
SELECT (SELECT CurrencyID FROM Currencies WHERE CurrencyCode = 'UAH'),
       (SELECT CurrencyID FROM Currencies WHERE CurrencyCode = 'EUR')
UNION ALL
SELECT (SELECT CurrencyID FROM Currencies WHERE CurrencyCode = 'EUR'),
       (SELECT CurrencyID FROM Currencies WHERE CurrencyCode = 'UAH')
UNION ALL

-- Balances: ініціалізуємо для кожного пункту 3 валюти (UAH, USD, EUR)
INSERT INTO Balances (PointID, CurrencyID, Amount)
SELECT p.PointID, c.CurrencyID,
    CASE c.CurrencyCode WHEN 'UAH' THEN 500000 WHEN 'USD' THEN 15000 WHEN 'EUR' THEN 12000 ELSE 5000 END
FROM ExchangePoints p
CROSS JOIN Currencies c
WHERE c.CurrencyCode IN ('UAH','USD','EUR')
AND p.PointName = N'Exchange Center №1';  -- для одного пункту
GO

INSERT INTO Balances (PointID, CurrencyID, Amount)
SELECT p.PointID, c.CurrencyID,
    CASE c.CurrencyCode WHEN 'UAH' THEN 300000 WHEN 'USD' THEN 8000 WHEN 'EUR' THEN 6000 ELSE 2000 END
FROM ExchangePoints p
CROSS JOIN Currencies c
WHERE c.CurrencyCode IN ('UAH','USD','EUR')
AND p.PointName = N'EuroChange';
GO

INSERT INTO Balances (PointID, CurrencyID, Amount)
SELECT p.PointID, c.CurrencyID,
    CASE c.CurrencyCode WHEN 'UAH' THEN 200000 WHEN 'USD' THEN 7000 WHEN 'EUR' THEN 5000 ELSE 1500 END
FROM ExchangePoints p
CROSS JOIN Currencies c
WHERE c.CurrencyCode IN ('UAH','USD','EUR')
AND p.PointName = N'BestRate';
GO

-- Reports (приклад)
INSERT INTO Reports (AdminID, ReportType, Description, FilePath)
VALUES
((SELECT UserID FROM Users WHERE Rolle = 'admin'), N'daily', N'Щоденний звіт', NULL),
((SELECT UserID FROM Users WHERE Rolle = 'admin'), N'monthly', N'Місячний звіт', NULL),
((SELECT UserID FROM Users WHERE Rolle = 'admin'), N'custom', N'Звіт по запиту', NULL);
GO

-- ПРИКЛАД: використання sp_PerformExchange
-- 1) EUR -> USD (клієнт віддає 100 EUR, отримає USD)
DECLARE @client INT = (SELECT TOP 1 ClientID FROM Clients);
DECLARE @cashier INT = (SELECT TOP 1 UserID FROM Users WHERE Rolle = 'cashier');
DECLARE @point INT = (SELECT PointID FROM ExchangePoints WHERE PointName = N'Exchange Center №1');

EXEC sp_PerformExchange @ClientID = @client, @CashierID = @cashier, @PointID = @point, @FromCode = N'EUR', @ToCode = N'USD', @AmountFrom = 100;
SELECT TOP 5 * FROM v_OperationsInfo ORDER BY OperationDate DESC;
GO

-- 2) UAH -> USD (наприклад клієнт купує USD за гривні)
DECLARE @client INT = (SELECT TOP 1 ClientID FROM Clients);
DECLARE @cashier INT = (SELECT TOP 1 UserID FROM Users WHERE Rolle = 'cashier');
DECLARE @point INT = (SELECT PointID FROM ExchangePoints WHERE PointName = N'Exchange Center №1');

EXEC sp_PerformExchange @ClientID = @client, @CashierID = @cashier, @PointID = @point, @FromCode = N'UAH', @ToCode = N'USD', @AmountFrom = 4000; -- 4000 UAH
SELECT TOP 5 * FROM v_OperationsInfo ORDER BY OperationDate DESC;
GO

-- 3) USD -> UAH (продаж долара в обмінник)
DECLARE @client INT = (SELECT TOP 1 ClientID FROM Clients);
DECLARE @cashier INT = (SELECT TOP 1 UserID FROM Users WHERE Rolle = 'cashier');
DECLARE @point INT = (SELECT PointID FROM ExchangePoints WHERE PointName = N'Exchange Center №1');

EXEC sp_PerformExchange @ClientID = @client, @CashierID = @cashier, @PointID = @point, @FromCode = N'USD', @ToCode = N'UAH', @AmountFrom = 100; -- 100 USD
SELECT TOP 5 * FROM v_OperationsInfo ORDER BY OperationDate DESC;
GO

CREATE OR ALTER VIEW v_PointBalances AS
SELECT 
    ep.PointID,
    ep.PointName,
    cur.CurrencyCode,
    SUM(
        CASE 
            WHEN o.FromCurrencyID = cur.CurrencyID THEN -o.AmountFrom
            WHEN o.ToCurrencyID = cur.CurrencyID THEN  o.AmountTo
            ELSE 0
        END
    ) AS Balance
FROM ExchangePoints ep
LEFT JOIN Operations o ON o.PointID = ep.PointID
LEFT JOIN Currencies cur ON cur.CurrencyID IN (o.FromCurrencyID, o.ToCurrencyID)
GROUP BY ep.PointID, ep.PointName, cur.CurrencyCode;
GO


SELECT * FROM v_PointBalances;

DECLARE @point INT = (SELECT TOP 1 PointID FROM Operations ORDER BY OperationDate DESC);
DECLARE @from INT  = (SELECT TOP 1 FromCurrencyID FROM Operations ORDER BY OperationDate DESC);
DECLARE @to   INT  = (SELECT TOP 1 ToCurrencyID   FROM Operations ORDER BY OperationDate DESC);

SELECT p.PointName, c.CurrencyCode, b.Amount
FROM Balances b
JOIN ExchangePoints p ON b.PointID = p.PointID
JOIN Currencies c ON b.CurrencyID = c.CurrencyID
WHERE b.PointID = @point
  AND b.CurrencyID IN (@from, @to);

 CREATE OR ALTER VIEW v_OperationsProfit AS
SELECT 
    o.OperationID,
    o.OperationDate,
    o.AmountFrom,
    o.AmountTo,
    o.TotalUAH,
    cf.CurrencyCode AS FromCurrency,
    ct.CurrencyCode AS ToCurrency,
    cf.BuyRate  AS FromBuyRate,
    cf.SellRate AS FromSellRate,
    ct.BuyRate  AS ToBuyRate,
    ct.SellRate AS ToSellRate,
    -- Реальний прибуток обмінного пункту
    CASE 
        WHEN cf.CurrencyCode = 'UAH' THEN 
            -- Коли клієнт купує інвалюту за гривні:
            (ct.SellRate - ct.BuyRate) * o.AmountTo
        WHEN ct.CurrencyCode = 'UAH' THEN 
            -- Коли клієнт здає інвалюту й отримує гривні:
            (cf.SellRate - cf.BuyRate) * o.AmountFrom
        ELSE 
            -- Якщо обмін між двома інвалютами — через UAH
            ((ct.SellRate - ct.BuyRate) + (cf.SellRate - cf.BuyRate)) / 2 * o.AmountFrom
    END AS ProfitUAH
FROM Operations o
JOIN Currencies cf ON o.FromCurrencyID = cf.CurrencyID
JOIN Currencies ct ON o.ToCurrencyID   = ct.CurrencyID;
GO

SELECT TOP 10 * FROM v_OperationsProfit;

-- КІНЕЦЬ скрипта . ////