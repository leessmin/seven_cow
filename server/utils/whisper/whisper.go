package whisper

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func WhisperHandle(filePath string) (string, error) {
	tmpDir, err := ensureTmpDir()
	if err != nil {
		return "", err
	}

	// 使用输入文件名生成 txt 文件名
	baseName := filepath.Base(filePath)
	nameWithoutExt := strings.TrimSuffix(baseName, filepath.Ext(baseName))
	txtFilePath := filepath.Join(tmpDir, nameWithoutExt+".txt")

	// 调用 whisper 命令
	cmd := exec.Command(
		"whisper",
		filePath,
		"--model", "tiny",
		"--language", "zh",
		"--initial_prompt", "以下是普通话的句子。",
		"--fp16", "False",
		"--output_format", "txt",
		"--output_dir", tmpDir,
	)

	if output, err := cmd.CombinedOutput(); err != nil {
		return "", fmt.Errorf("whisper error: %v, output: %s", err, string(output))
	}

	// 读取生成的文本文件
	content, err := os.ReadFile(txtFilePath)
	if err != nil {
		return "", fmt.Errorf("failed to read txt file: %v", err)
	}

	// 删除临时文件
	_ = os.Remove(txtFilePath)

	return string(content), nil
}

// 确保临时目录存在
func ensureTmpDir() (string, error) {
	// 确保临时目录存在
	tmpDir := "./tmp"
	if err := os.MkdirAll(tmpDir, os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create tmp dir: %v", err)
	}
	return tmpDir, nil
}
