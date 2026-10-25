import assert from 'node:assert/strict';
import test from 'node:test';

import { isExpectedModelFileSize, isSha256Hex, modelFilenameFromPath } from './model-file-validation.ts';

test('accepts only a complete model file', () => {
  assert.equal(isExpectedModelFileSize(1_282_439_360, 1_282_439_360), true);
  assert.equal(isExpectedModelFileSize(1_200_000_000, 1_282_439_360), false);
  assert.equal(isExpectedModelFileSize(undefined, 1_282_439_360), false);
});

test('rejects an oversized response such as an HTML or proxy artifact', () => {
  assert.equal(isExpectedModelFileSize(1_282_439_361, 1_282_439_360), false);
});

test('a published checksum is 64 lowercase hex digits', () => {
  assert.equal(isSha256Hex('aaf42c8b7c3cab2bf3d69c355048d4a0ee9973d48f16c731c0520ee914699223'), true);
  assert.equal(isSha256Hex('AAF42C8B7C3CAB2BF3D69C355048D4A0EE9973D48F16C731C0520EE914699223'), false);
  assert.equal(isSha256Hex('aaf42c8b'), false);
  assert.equal(isSha256Hex(undefined), false);
});

test('a stored desktop model path is reduced to its filename', () => {
  assert.equal(modelFilenameFromPath('/Library/Application Support/com.alicebitcoin.desktop/models/Qwen3.5-4B-Q4_K_M.gguf'), 'Qwen3.5-4B-Q4_K_M.gguf');
  assert.equal(modelFilenameFromPath('C:\\Users\\a\\AppData\\Local\\com.alicebitcoin.desktop\\models\\Qwen3.5-4B-Q4_K_M.gguf'), 'Qwen3.5-4B-Q4_K_M.gguf');
  assert.equal(modelFilenameFromPath('/etc/passwd'), null);
  assert.equal(modelFilenameFromPath(''), null);
  assert.equal(modelFilenameFromPath(null), null);
});
