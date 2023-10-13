import simpleaudio as sa


def play_sound():
    path = "/Users/qit/Documents/wsapp/wsapp/server/util/ding.wav"
    path = "/Users/qit/Documents/wsapp/wsapp/server/util/cancel.wav"
    wave_obj = sa.WaveObject.from_wave_file(path)
    wave_obj.play()
    # play_obj.wait_done()


def play_monitor_sound():
    path = "/Users/qit/Documents/wsapp/wsapp/server/util/alert.wav"
    path = "/Users/qit/Documents/wsapp/wsapp/server/util/cancel.wav"
    wave_obj = sa.WaveObject.from_wave_file(path)
    wave_obj.play()


def play_cancel_sound():
    path = "/Users/qit/Documents/wsapp/wsapp/server/util/cancel.wav"
    wave_obj = sa.WaveObject.from_wave_file(path)
    wave_obj.play()


# play_sound()

# sounder = play_sound()
