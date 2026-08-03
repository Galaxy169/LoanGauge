CREATE DATABASE IF NOT EXISTS loangauge;
USE loangauge;

CREATE TABLE role (
    role_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE subscription (
    subscription_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_name       VARCHAR(50) NOT NULL,
    price           DECIMAL(10,2) NOT NULL DEFAULT 0,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user (
    user_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role_id         BIGINT NOT NULL,
    subscription_id BIGINT,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    phone           VARCHAR(20),
    profile_picture_url VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role(role_id),
    FOREIGN KEY (subscription_id) REFERENCES subscription(subscription_id)
);

CREATE TABLE financial_profile (
    profile_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL UNIQUE,
    age                 INT,
    marital_status      VARCHAR(30),
    dependents          INT,
    city_type           VARCHAR(30),
    employment_type     VARCHAR(30),
    work_experience_years INT,
    income_stability    VARCHAR(30),
    monthly_income      DECIMAL(12,2),
    monthly_expenses    DECIMAL(12,2),
    existing_loans      INT,
    monthly_emi         DECIMAL(12,2),
    credit_card_balance DECIMAL(12,2),
    savings             DECIMAL(12,2),
    fixed_deposits      DECIMAL(12,2),
    investments         DECIMAL(12,2),
    emergency_fund      DECIMAL(12,2),
    cibil_score         INT,
    credit_utilization  DECIMAL(5,2),
    notes               VARCHAR(255),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE loan_type (
    loan_type_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_name         VARCHAR(100) NOT NULL,
    category          VARCHAR(20) NOT NULL,
    interest_rate     DECIMAL(5,2) NOT NULL,
    min_interest_rate DECIMAL(5,2),
    max_interest_rate DECIMAL(5,2),
    max_tenure_months INT NOT NULL,
    min_loan_amount   DECIMAL(12,2),
    max_loan_amount   DECIMAL(12,2),
    min_tenure_months INT,
    foir_excellent_max DECIMAL(5,2),
    foir_acceptable_max DECIMAL(5,2),
    foir_caution_max    DECIMAL(5,2),
    dti_low_max      DECIMAL(5,2),
    dti_moderate_max DECIMAL(5,2),
    dti_high_max     DECIMAL(5,2),
    multiplier       DECIMAL(5,2),
    description      VARCHAR(255),
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE financial_goal (
    goal_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT NOT NULL,
    goal_name      VARCHAR(150) NOT NULL,
    target_amount  DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    target_date    DATE NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    notes          VARCHAR(255),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE loan_assessment (
    assessment_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT NOT NULL,
    loan_type_id      BIGINT NOT NULL,
    loan_amount       DECIMAL(12,2) NOT NULL,
    tenure_months     INT NOT NULL,
    interest_rate     DECIMAL(5,2) NOT NULL,
    emi               DECIMAL(12,2),
    foir              DECIMAL(5,2),
    dti               DECIMAL(5,2),
    savings_ratio     DECIMAL(5,2),
    emergency_fund_coverage_months DECIMAL(5,2),
    credit_utilization DECIMAL(5,2),
    disposable_income DECIMAL(12,2),
    financial_score   INT,
    risk_level        VARCHAR(30),
    eligible_amount   DECIMAL(12,2),
    status            VARCHAR(20) DEFAULT 'COMPLETED',
    assessment_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (loan_type_id) REFERENCES loan_type(loan_type_id)
);

CREATE TABLE advisor_consultation (
    consultation_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id     BIGINT NOT NULL,
    user_id           BIGINT NOT NULL,
    advisor_user_id   BIGINT NOT NULL,
    remarks           TEXT,
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES loan_assessment(assessment_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (advisor_user_id) REFERENCES user(user_id)
);

INSERT INTO role (role_name, description) VALUES
  ('USER', 'Standard registered user'),
  ('PREMIUM_USER', 'Paid subscriber with full feature access'),
  ('FINANCIAL_ADVISOR', 'Reviews assessments and gives professional guidance'),
  ('ADMINISTRATOR', 'Manages users, loan types, subscriptions, and system settings');

INSERT INTO subscription (plan_name, price, status) VALUES
  ('FREE', 0.00, 'ACTIVE'),
  ('PREMIUM', 499.00, 'ACTIVE');

INSERT INTO loan_type
  (loan_name, category, interest_rate, min_interest_rate, max_interest_rate, max_tenure_months,
   min_loan_amount, max_loan_amount, min_tenure_months,
   foir_excellent_max, foir_acceptable_max, foir_caution_max,
   dti_low_max, dti_moderate_max, dti_high_max, multiplier, description)
VALUES
  ('Home Loan', 'SECURED', 8.50, 7.50, 11.50, 240, 100000, 100000000, 12, 45, 60, 70, 35, 50, 60, 55, 'Secured against property'),
  ('Auto Loan', 'SECURED', 9.50, 7.50, 14.00, 84,  50000,  5000000,   12, 40, 55, 65, 30, 45, 55, 20, 'Secured against vehicle'),
  ('Personal Loan', 'UNSECURED', 13.00, 10.00, 24.00, 60, 10000,  4000000,   6,  40, 50, 60, 30, 40, 50, 15, 'Unsecured, higher rate'),
  ('Education Loan', 'SECURED', 10.00, 8.00, 15.00, 180, 50000,  15000000,  12, 40, 55, 65, 30, 45, 55, 20, 'Semi-secured, income-based');