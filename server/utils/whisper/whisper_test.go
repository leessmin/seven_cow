package whisper

import "testing"

func TestWhisper(t *testing.T) {
	contest, err := WhisperHandle("/home/leessmin/Downloads/hello.m4a")
	if err != nil {
		t.Fatal(err)
	}
	t.Log(contest)
}
