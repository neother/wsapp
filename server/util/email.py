import click
import sys
import smtplib
from email.mime.text import MIMEText
import re
import datetime
from .logger import logger

class Email(object):
    
    @classmethod
    def send_email(cls,content):
        smtpHost = 'smtp.126.com'
        sender = 'neother22@126.com'
        receiver = 'neother@126.com'
        msg = MIMEText(content)
        subject = re.findall(r'[(].*?[)]',str(content))
        msg['Subject'] = 'results'#+' '.join(subject)
        msg['From'] = sender
        msg['To'] = receiver
        smtpServer = smtplib.SMTP(smtpHost, 25)
        smtpServer.login(sender, sys.argv[1])
        try:
            # logger.info()
            smtpServer.sendmail(sender, receiver, msg.as_string())
            logger.info('email: true')
            return True
        except Exception as e:
            logger.info('send failed: ' + str(e))
            return False
        finally:
            smtpServer.quit()