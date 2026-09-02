# Question Bank Excel Template

This document defines the Excel format used to import questions into the Question Bank.

## Purpose

The Super Admin can prepare questions in Excel and import them into the application.

The Excel file should contain one sheet named:

`Questions`

---

## Excel Columns

| Column           | Required | Description                           | Example                                     |
| ---------------- | -------- | ------------------------------------- | ------------------------------------------- |
| class            | Yes      | Class number from 1 to 10             | 6                                           |
| medium           | Yes      | Question medium                       | ENGLISH                                     |
| subject          | Yes      | Subject name                          | Science                                     |
| chapter          | Yes      | Chapter name                          | Food Where Does It Come From                |
| questionType     | Yes      | Type of question                      | MCQ                                         |
| question         | Yes      | Question text                         | Which of the following is a source of food? |
| optionA          | For MCQ  | Option A                              | Plants                                      |
| optionB          | For MCQ  | Option B                              | Rocks                                       |
| optionC          | For MCQ  | Option C                              | Plastic                                     |
| optionD          | For MCQ  | Option D                              | Glass                                       |
| correctAnswer    | Yes      | Correct answer                        | A                                           |
| answer           | Yes      | Complete answer/explanation           | Plants are a source of food.                |
| difficulty       | Yes      | Difficulty level                      | EASY                                        |
| marks            | Yes      | Marks for the question                | 1                                           |
| questionNumber   | No       | Original question number              | 1                                           |
| hasDiagram       | No       | Whether question contains a diagram   | FALSE                                       |
| diagramReference | No       | Diagram identifier/path if applicable | food-chain-01                               |
| tags             | No       | Comma-separated tags                  | food,plants,sources                         |

---

## Allowed Values

### class

Allowed values:

- 1
- 2
- 3
- 4
- 5
- 6
- 7
- 8
- 9
- 10

Example:

`6`

---

### medium

Allowed values:

- `ENGLISH`
- `MARATHI`

Example:

`ENGLISH`

---

### questionType

Allowed values:

- `MCQ`
- `SHORT_ANSWER`
- `LONG_ANSWER`

Example:

`MCQ`

---

### difficulty

Allowed values:

- `EASY`
- `MEDIUM`
- `HARD`

Example:

`MEDIUM`

---

## MCQ Questions

For MCQ questions:

- `optionA` is required
- `optionB` is required
- `optionC` is required
- `optionD` is required
- `correctAnswer` must be one of:
  - `A`
  - `B`
  - `C`
  - `D`

Example:

| class | medium  | subject | chapter | questionType | question                   | optionA | optionB | optionC | optionD | correctAnswer | answer                       | difficulty | marks |
| ----- | ------- | ------- | ------- | ------------ | -------------------------- | ------- | ------- | ------- | ------- | ------------- | ---------------------------- | ---------- | ----- |
| 6     | ENGLISH | Science | Food    | MCQ          | Which is a source of food? | Plants  | Rocks   | Plastic | Glass   | A             | Plants are a source of food. | EASY       | 1     |

---

## Short Answer Questions

For `SHORT_ANSWER` questions:

- Options are not required.
- `correctAnswer` can be left blank.
- `answer` should contain the expected answer.

Example:

| class | medium  | subject | chapter | questionType | question                  | optionA | optionB | optionC | optionD | correctAnswer | answer                                         | difficulty | marks |
| ----- | ------- | ------- | ------- | ------------ | ------------------------- | ------- | ------- | ------- | ------- | ------------- | ---------------------------------------------- | ---------- | ----- |
| 6     | ENGLISH | Science | Food    | SHORT_ANSWER | What are sources of food? |         |         |         |         |               | Plants and animals are common sources of food. | EASY       | 2     |

---

## Long Answer Questions

For `LONG_ANSWER` questions:

- Options are not required.
- `correctAnswer` can be left blank.
- `answer` should contain the complete expected answer.

Example:

| class | medium  | subject | chapter | questionType | question                     | correctAnswer | answer                                                                                                                                     | difficulty | marks |
| ----- | ------- | ------- | ------- | ------------ | ---------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ----- |
| 6     | ENGLISH | Science | Food    | LONG_ANSWER  | Explain the sources of food. |               | Plants and animals provide us with food. Plants provide cereals, pulses, fruits and vegetables, while animals provide milk, eggs and meat. | MEDIUM     | 5     |

---

## Important Rules

1. Column names must match the template exactly.
2. `class`, `medium`, `subject`, `chapter`, `questionType`, `question`, `answer`, `difficulty`, and `marks` are required.
3. For MCQ questions, all four options are required.
4. For MCQ questions, `correctAnswer` must be A, B, C, or D.
5. For SHORT_ANSWER and LONG_ANSWER questions, options can be empty.
6. `marks` must be a positive number.
7. `difficulty` must be EASY, MEDIUM, or HARD.
8. `medium` must be ENGLISH or MARATHI.
9. Do not leave required fields empty.
10. Avoid duplicate questions within the same class, subject and chapter.
11. Do not use formulas in Excel cells.
12. Do not merge cells.
13. Keep one question per row.
14. The first row must contain column headers.

---

## Recommended Excel File Name

Use:

`question-bank-template.xlsx`

Example imported file:

`class-6-science-english.xlsx`

---

## Sample Data

| class | medium  | subject | chapter | questionType | question                                          | optionA | optionB | optionC | optionD | correctAnswer | answer                                                                                                                                                    | difficulty | marks |
| ----- | ------- | ------- | ------- | ------------ | ------------------------------------------------- | ------- | ------- | ------- | ------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----- |
| 6     | ENGLISH | Science | Food    | MCQ          | Which of the following is a source of food?       | Plants  | Rocks   | Plastic | Glass   | A             | Plants are a source of food.                                                                                                                              | EASY       | 1     |
| 6     | ENGLISH | Science | Food    | MCQ          | Which animal gives us milk?                       | Cow     | Lion    | Tiger   | Crow    | A             | Cow gives us milk.                                                                                                                                        | EASY       | 1     |
| 6     | ENGLISH | Science | Food    | SHORT_ANSWER | What do we get from plants?                       |         |         |         |         |               | We get cereals, pulses, fruits and vegetables from plants.                                                                                                | EASY       | 2     |
| 6     | ENGLISH | Science | Food    | LONG_ANSWER  | Explain why plants are important sources of food. |         |         |         |         |               | Plants provide us with cereals, pulses, fruits, vegetables, fruits and other food materials. They are an important source of food for humans and animals. | MEDIUM     | 5     |
