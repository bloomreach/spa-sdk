<!--
  Copyright 2020-2023 Bloomreach

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  -->

<template>
  <nav aria-label="News List Pagination">
    <ul class="pagination">
      <li class="page-item" :class="{ disabled: !pageable.previous }">
        <router-link :to="previousUrl" class="page-link" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
          <span class="sr-only">Previous</span>
        </router-link>
      </li>
      <li
        v-for="(pageNumber, key) in pageable.pageNumbersArray"
        :key="key"
        class="page-item"
        :class="{ active: pageNumber === pageable.currentPage }"
      >
        <router-link :to="page.getUrl(`?page=${pageNumber}`)" class="page-link">{{ pageNumber }}</router-link>
      </li>
      <li class="page-item" :class="{ disabled: !pageable.next }">
        <router-link :to="nextUrl" class="page-link" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
          <span class="sr-only">Next</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { Page } from '@bloomreach/spa-sdk';
import { computed, toRefs } from 'vue';

const props = defineProps<{
  pageable: Pageable,
  page: Page,
}>();
const { pageable, page } = toRefs(props);

const nextUrl = computed(() => (pageable.value.next ? page.value.getUrl(`?page=${pageable.value.nextPage}`) : '#'))
const previousUrl = computed(() => (pageable.value.previous ? page.value.getUrl(`?page=${pageable.value.previousPage}`) : '#'));
</script>
