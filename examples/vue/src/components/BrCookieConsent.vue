<!--
  Copyright 2020-2021 Bloomreach

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  -->

<script lang="ts">
import { VNode } from 'vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import CookieConsentInit, { isConsentReceived, runPersonalization } from '../utils/cookieconsent';

@Component({
  name: 'br-cookie-consent',

  render(createElement): VNode {
    return createElement();
  },
})
export default class BrCookieConsent extends Vue {
  @Prop() isPreview!: boolean;

  @Prop() path!: string;

  created(): void {
    if (!this.isPreview) {
      CookieConsentInit();
    }
  }

  @Watch('path')
  personalized(): void {
    if (!this.isPreview && isConsentReceived()) {
      runPersonalization(this.path);
    }
  }
}
</script>
