#!/usr/bin/env python3
"""
Simple Number Guessing Game
The computer picks a random number between 1 and 100,
and you try to guess it with hints!
"""

import random

def number_guessing_game():
    # Welcome message
    print("🎯 Welcome to the Number Guessing Game!")
    print("I'm thinking of a number between 1 and 100.")
    print("Can you guess what it is?\n")

    # Generate random number
    secret_number = random.randint(1, 100)
    attempts = 0
    guessed_correctly = False

    while not guessed_correctly:
        try:
            # Get user's guess
            guess = input("Enter your guess (1-100): ")
            guess = int(guess)
            attempts += 1

            # Check if guess is in valid range
            if guess < 1 or guess > 100:
                print("❌ Please enter a number between 1 and 100!")
                continue

            # Check the guess
            if guess < secret_number:
                print("📈 Too low! Try a higher number.")
            elif guess > secret_number:
                print("📉 Too high! Try a lower number.")
            else:
                print(f"🎉 Congratulations! You guessed it in {attempts} attempts!")
                guessed_correctly = True

        except ValueError:
            print("❌ Please enter a valid number!")

    # Ask to play again
    play_again = input("\nWould you like to play again? (yes/no): ").lower()
    if play_again in ['yes', 'y', 'sure']:
        print("\n" + "="*50)
        number_guessing_game()
    else:
        print("Thanks for playing! 👋")

if __name__ == "__main__":
    number_guessing_game()


