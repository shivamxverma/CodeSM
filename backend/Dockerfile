FROM gcc:latest

WORKDIR /app

COPY ./code/user_code.cpp .
COPY ./code/input.txt .

RUN g++ user_code.cpp -o user_program

CMD ["sh", "-c", "./user_program < input.txt"]

