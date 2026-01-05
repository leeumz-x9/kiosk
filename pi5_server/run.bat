@echo off
REM Run simulated server using venv with Flask
cd /d "%~dp0"
call venv_d\Scripts\activate.bat
python run_simulated.py
pause
