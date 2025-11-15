<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-toolbar-title>🖼️ Bond & Nego 문서 추출</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4 fill-height">
        <v-row class="fill-height">
          <!-- 왼쪽: 이미지 업로드 영역 (5) -->
          <v-col cols="12" md="6" class="d-flex flex-column">
            <v-card class="flex-grow-1 d-flex flex-column">
              <v-card-text class="d-flex flex-column flex-grow-1">
                <!-- 버튼 영역 -->
                <v-row dense class="mb-4 flex-grow-0">
                  <v-col cols="6">
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-upload"
                      block
                      :loading="uploading"
                      :disabled="uploading"
                      @click="triggerFileInput"
                    >
                      {{ uploading ? '업로드 중...' : '파일 업로드' }}
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn
                      color="grey"
                      block
                      :disabled="uploading"
                      @click="handleReset"
                    >
                      초기화
                    </v-btn>
                  </v-col>
                </v-row>

                <!-- 에러 메시지 -->
                <v-alert
                  v-if="error"
                  type="error"
                  closable
                  @click:close="error = null"
                  class="mb-4"
                >
                  {{ error }}
                </v-alert>

                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  :disabled="uploading"
                  @change="handleFileUpload"
                />

                <!-- 이미지 표시 영역 -->
                <v-card
                  class="d-flex align-center justify-center flex-grow-1"
                  variant="outlined"
                  style="background-color: #f5f5f5; overflow: hidden;"
                >
                  <v-progress-circular
                    v-if="uploading"
                    indeterminate
                    color="primary"
                    size="64"
                  ></v-progress-circular>
                  <v-img
                    v-else-if="imageUrl"
                    :src="imageUrl"
                    height="100%"
                    contain
                  ></v-img>
                  <div v-else class="text-center text-grey">
                    <v-icon size="80" class="mb-4">mdi-camera</v-icon>
                    <p class="text-h6">이미지를 업로드해주세요</p>
                  </div>
                </v-card>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 오른쪽: 정보 표시 영역 (5) -->
          <v-col cols="12" md="6" class="d-flex flex-column">
            <v-card class="flex-grow-1">
              <v-card-title>문서 정보</v-card-title>
              <v-card-text>
                <!-- Grid 형태로 라벨-값 표시 (4행) -->
                <v-row class="border-b py-3" v-for="key in keys">
                  <v-col cols="6" class="font-weight-bold">{{ key }}</v-col>
                  <v-col cols="6">{{ jsonData[0][key] }}</v-col>
                </v-row>

                <!-- <v-row class="border-b py-3">
                  <v-col cols="6" class="font-weight-bold">파일 크기</v-col>
                  <v-col cols="6">{{ imageData.fileSize }}</v-col>
                </v-row>

                <v-row class="border-b py-3">
                  <v-col cols="6" class="font-weight-bold">이미지 크기</v-col>
                  <v-col cols="6">{{ imageData.dimensions }}</v-col>
                </v-row>

                <v-row class="py-3">
                  <v-col cols="6" class="font-weight-bold">업로드 날짜</v-col>
                  <v-col cols="6">{{ imageData.uploadDate }}</v-col>
                </v-row> -->
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const fileInput = ref(null)
const imageUrl = ref(null)
const imageData = ref({
  fileName: '-',
  fileSize: '-',
  dimensions: '-',
  uploadDate: '-'
})
const uploading = ref(false)
const error = ref(null)

// API 엔드포인트 설정 (Python API 주소로 변경 필요)
const API_ENDPOINT = 'http://localhost:8001/v1/api/extract'

let jsonData = ref(null);

let keys = ref([]);

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  console.log('file:', file);

  // 로컬 미리보기 생성
  const localUrl = URL.createObjectURL(file)
  imageUrl.value = localUrl
  error.value = null
  uploading.value = true

  // 이미지 정보 추출
  const img = new Image()
  img.onload = () => {
    imageData.value = {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      dimensions: `${img.width} x ${img.height}`,
      uploadDate: new Date().toLocaleString('ko-KR')
    }
  }
  img.src = localUrl

  try {
    // FormData 객체 생성
    const formData = new FormData()
    formData.append('original', file)

    console.log('API_ENDPOINT', API_ENDPOINT);
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, value.name, value);
      } else {
        console.log(key, value);
      }
    }

    // Python API로 이미지 업로드
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
      // headers에 Content-Type을 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
    })

    console.log('response', response);

    if (!response.ok) {
      throw new Error(`업로드 실패: ${response.status} ${response.statusText}`)
    }

    // API 응답 처리
    const result = await response.json()
  
    console.log('업로드 성공:', result)
    
  } catch (err) {
    console.error('업로드 에러:', err)
    error.value = err.message
    // 에러 발생 시 이미지 초기화
    //imageUrl.value = null
  } finally {
    uploading.value = false;

    jsonData.value = [
      {
        'title1': 'value1',
        'title2': 'value2',
        'title3': 'value3',
        'title4': 'value4',
        'title5': 'value5',
        'title6': 'value6',
        'title7': 'value7',
        'title8': 'value8',
        'title9': 'value9',
        'title10': 'value10'
      }
    ];

    keys.value = Object.keys(jsonData.value[0]);

    console.log('jsonData:', jsonData.value);
    console.log('keys:', keys.value);
  }

  /* 기존 로컬 업로드 코드 (코멘트 처리)
  const file = event.target.files[0]
  if (file) {
    // 이미지 URL 생성
    const url = URL.createObjectURL(file)
    imageUrl.value = url

    // 이미지 정보 추출
    const img = new Image()
    img.onload = () => {
      imageData.value = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        dimensions: `${img.width} x ${img.height}`,
        uploadDate: new Date().toLocaleString('ko-KR')
      }
    }
    img.src = url
  }
  */
}

const handleReset = () => {
  imageUrl.value = null
  imageData.value = {
    fileName: '-',
    fileSize: '-',
    dimensions: '-',
    uploadDate: '-'
  }
  error.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }

  jsonData.value = [];
  keys.value = [];
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}
</style>