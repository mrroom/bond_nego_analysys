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
                      @click="triggerFileInput"
                    >
                      파일 업로드
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn
                      color="grey"
                      block
                      @click="handleReset"
                    >
                      초기화
                    </v-btn>
                  </v-col>
                </v-row>

                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleFileUpload"
                />

                <!-- 이미지 표시 영역 -->
                <v-card
                  class="d-flex align-center justify-center flex-grow-1"
                  variant="outlined"
                  style="background-color: #f5f5f5; overflow: hidden;"
                >
                  <v-img
                    v-if="imageUrl"
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
              <v-card-title>이미지 정보</v-card-title>
              <v-card-text>
                <!-- Grid 형태로 라벨-값 표시 (4행) -->
                <v-row class="border-b py-3">
                  <v-col cols="6" class="font-weight-bold">파일명</v-col>
                  <v-col cols="6">{{ imageData.fileName }}</v-col>
                </v-row>

                <v-row class="border-b py-3">
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
                </v-row>
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

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
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
}

const handleReset = () => {
  imageUrl.value = null
  imageData.value = {
    fileName: '-',
    fileSize: '-',
    dimensions: '-',
    uploadDate: '-'
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}
</style>