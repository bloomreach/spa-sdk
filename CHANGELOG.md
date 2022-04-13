### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

#### [15.4.5](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.4.4...15.4.5)

- Resolve SPASDK-110 "Change HttpClient interface to follow the axios api definition" [`#68`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/68)
- SPASDK-110 Update axios in example apps to the latest version (0.26.1) [`#SPASDK-110`](https://issues.onehippo.com/browse/SPASDK-110)
- SPASDK-110 Make headers type in `HttpClient` compatible with latest axios (0.26.0) [`#SPASDK-110`](https://issues.onehippo.com/browse/SPASDK-110)

#### [spa-sdk-15.4.4](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.4.3...spa-sdk-15.4.4)

> 4 April 2022

- Resolve SPASDK-109 "Eature/ preview session persistence docs" [`#66`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/66)
- SPASDK-107 Indicate that the change only applies to Content SaaS [`#62`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/62)
- SPASDK-107 Describe template query formats in readme doc files [`#61`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/61)
- SPASDK-109 Describe solution to make persist the preview related data when navigated to the page without SPA SDK [`#SPASDK-109`](https://issues.onehippo.com/browse/SPASDK-109)
- SPASDK-107 Indicate that the change only applies to Content SaaS [`#SPASDK-107`](https://issues.onehippo.com/browse/SPASDK-107)
- SPASDK-107 Update template query names to correct ones in vue sdk doc [`#SPASDK-107`](https://issues.onehippo.com/browse/SPASDK-107)
- SPASDK-107 Describe template query formats in readme doc files [`#SPASDK-107`](https://issues.onehippo.com/browse/SPASDK-107)
- TRIVIAL Bumping versions to 15.4.4 [`2deeb62`](https://github.com/bloomreach/spa-sdk/commit/2deeb623dfb9c666035342a75d9ac7e96461050b)
- TRIVIAL Merge branch 'fetch-tags-during-release-pipeline' into 'development' [`4048f73`](https://github.com/bloomreach/spa-sdk/commit/4048f73dce43c1d3f99a6b28533779c52a8839ca)
- TRIVIAL Fetch all tags before mirroring to the github [`c7373de`](https://github.com/bloomreach/spa-sdk/commit/c7373de3213bf3a396d74efc74e0ad6ed11a07bd)

#### [spa-sdk-15.4.3](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.4.2...spa-sdk-15.4.3)

> 18 January 2022

- SPASDK-82 Release pipeline [`#56`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/56)
- SPASDK-80 Use origin from URL object instead of modifying incoming url [`#55`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/55)
- SPASDK-82 Fix branch name in release steps [`#SPASDK-82`](https://issues.onehippo.com/browse/SPASDK-82)
- SPASDK-82 Remove debug and test setup [`#SPASDK-82`](https://issues.onehippo.com/browse/SPASDK-82)
- SPASDK-82 Update release steps according to the latest changes [`#SPASDK-82`](https://issues.onehippo.com/browse/SPASDK-82)
- SPASDK-82 Remove release bash script [`#SPASDK-82`](https://issues.onehippo.com/browse/SPASDK-82)
- SPASDK-82 Use heroku from dev dependencies and run deploy via scripts section [`#SPASDK-82`](https://issues.onehippo.com/browse/SPASDK-82)
- SPASDK-82 Setup release pipeline triggered by merge in main branch [`#SPASDK-82`](https://issues.onehippo.com/browse/SPASDK-82)
- SPASDK-80 Use origin from URL object instead of modifying incoming url [`#SPASDK-80`](https://issues.onehippo.com/browse/SPASDK-80)
- TRIVIAL Bumping versions to 15.4.3 [`34b67fa`](https://github.com/bloomreach/spa-sdk/commit/34b67fa6a8144d2d0993d06c77320649ea19e8d0)

#### [spa-sdk-15.4.2](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.4.1...spa-sdk-15.4.2)

> 27 December 2021

- Resolve SPASDK-76 "Feature/ heroku cd pipeline" [`#51`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/51)
- Resolve SPASDK-78 "Feature/ add an alias for helper method getcontaineritemcontent" [`#53`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/53)
- Resolve SPASDK-77 "Feature/ add alias `getProperties` to match with experience manager terminology" [`#52`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/52)
- SPASDK-75 Update file header to replace Hippo with Bloomreach [`#48`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/48)
- SPASDK-76 Move release script to the scripts folder [`#SPASDK-76`](https://issues.onehippo.com/browse/SPASDK-76)
- SPASDK-76 Rename Jenkins email to consistency [`#SPASDK-76`](https://issues.onehippo.com/browse/SPASDK-76)
- SPASDK-76 Call explicitly yarn install [`#SPASDK-76`](https://issues.onehippo.com/browse/SPASDK-76)
- SPASDK-76 Remove script for heroku deploy from release script [`#SPASDK-76`](https://issues.onehippo.com/browse/SPASDK-76)
- SPASDK-76 HOME env variable already set at the begin of pipeline [`#SPASDK-76`](https://issues.onehippo.com/browse/SPASDK-76)
- SPASDK-76 Remove unused args for docker container [`#SPASDK-76`](https://issues.onehippo.com/browse/SPASDK-76)
- SPASDK-76 Setup heroku cli via npm and provide bin path to deploy script [`#SPASDK-76`](https://issues.onehippo.com/browse/SPASDK-76)
- SPASDK-76 Chnage HOME env path to WORKSPACE path [`#SPASDK-76`](https://issues.onehippo.com/browse/SPASDK-76)
- SPASDK-76 Define matrix for deploy all example apps to heroku [`#SPASDK-76`](https://issues.onehippo.com/browse/SPASDK-76)
- SPASDK-76 Create a separate bash script to handle deploy specific app to heroku [`#SPASDK-76`](https://issues.onehippo.com/browse/SPASDK-76)
- SPASDK-78 Add method `getContent` to Container Item [`#SPASDK-78`](https://issues.onehippo.com/browse/SPASDK-78)
- SPASDK-78 Add description for the method `getContentReference` in Container Item [`#SPASDK-78`](https://issues.onehippo.com/browse/SPASDK-78)
- SPASDK-77 Add `getProperies` method to the mock object in react sdk [`#SPASDK-77`](https://issues.onehippo.com/browse/SPASDK-77)
- SPASDK-77 Verify that getProperties return paramsInfo for container item [`#SPASDK-77`](https://issues.onehippo.com/browse/SPASDK-77)
- SPASDK-77 Add `getProperties` method as alias for `getParameters` in component [`#SPASDK-77`](https://issues.onehippo.com/browse/SPASDK-77)
- SPASDK-75 Update file header to replace Hippo with Bloomreach [`#SPASDK-75`](https://issues.onehippo.com/browse/SPASDK-75)
- SPASDK-75 Update file header to replace Hippo with Bloomreach [`#SPASDK-75`](https://issues.onehippo.com/browse/SPASDK-75)
- TRIVIAL Bumping version to 15.4.2 [`9e6391a`](https://github.com/bloomreach/spa-sdk/commit/9e6391a5cb8381da2a41d6746b892fc18cb44d13)
- TRIVIAL Merge branch 'trivial/enhance-release-script' into 'development' [`0a0df95`](https://github.com/bloomreach/spa-sdk/commit/0a0df958ff9274fdb366d8ebfc09952803c2a882)
- TRIVIAL Stop execution of release in case build, lint or test has been finished with non zero result [`35393c8`](https://github.com/bloomreach/spa-sdk/commit/35393c8b4046c91bf1ce5b12170c86eb17a39b75)
- TRIVIAL Add reminder to post release actions about check typedoc [`49e01ce`](https://github.com/bloomreach/spa-sdk/commit/49e01ce7df91a18a631744f1ad74bb435dddf326)
- TRIVIAL Merge branch 'enhance-release-script' into development [`f45e24c`](https://github.com/bloomreach/spa-sdk/commit/f45e24c9c12201d0fce6b3c8ed51f0b7461d717f)
- TRIVIAL Add lint, test and build steps at the beginning of the script [`60dd968`](https://github.com/bloomreach/spa-sdk/commit/60dd9681110ab611e4efa62e3e4f859513a549d2)

#### [spa-sdk-15.4.1](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.4.0...spa-sdk-15.4.1)

> 1 December 2021

- TRIVIAL Bumping version to 15.4.1 [`65dd1c3`](https://github.com/bloomreach/spa-sdk/commit/65dd1c38be90986df001eec1c28f74f76a6520fa)
- TRIVIAL Update release script with build step before publising [`b377221`](https://github.com/bloomreach/spa-sdk/commit/b377221d974138c1ee092610c037ee1987b765b6)

#### [spa-sdk-15.4.0](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.3.3...spa-sdk-15.4.0)

> 1 December 2021

- Resolve SPASDK-72 "Feature/ add cookie consent dialog to example apps" [`#46`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/46)
- SPASDK-73 Add "picker" options to manage-content-button [`#45`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/45)
- SPASDK-72 Update readmes about cookie consent popup and personalisation [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 Use single if for nuxt consent component [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 Fix missed copyrights headers [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 Align cookie consent implementation to prevent reinitialisation of it [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 Init consent during app lifecycle to hide it on preview [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 Run only campaign personalization if exponea token and url are absent [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 Move exponea api url to the environment varable for all examples [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 Move work with segmentation lib to cookieconsent util [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 Align all example apps to using the same util file with cookie consent [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 [next] Use cookieconsent lib to consistency with the rest of examples [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 [react] Initialise personalisation based on consent value [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 [vue] Initialise personalisation based on consent value [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 [angular] Initialise personalisation based on consent value [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 [nuxt] Initialise personalisation based on consent value [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 [next] Initialise personalisation based on consent value [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 [next] Show cookie consent window and inject Exponea snippet on accept [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-72 Remove logic by saving cookie for campaign [`#SPASDK-72`](https://issues.onehippo.com/browse/SPASDK-72)
- SPASDK-74 Load component via GET if payload is empty [`#SPASDK-74`](https://issues.onehippo.com/browse/SPASDK-74)
- SPASDK-73 Add "pickerSelectableNodeTypes" to examples [`#SPASDK-73`](https://issues.onehippo.com/browse/SPASDK-73)
- SPASDK-73 Add "picker" options to manage-content-button [`#SPASDK-73`](https://issues.onehippo.com/browse/SPASDK-73)
- TRIVIAL Bumping version to 15.4.0 [`ba8e0ad`](https://github.com/bloomreach/spa-sdk/commit/ba8e0adb0547e41e26d0691560884b340c7d512a)

#### [spa-sdk-15.3.3](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.3.2...spa-sdk-15.3.3)

> 1 November 2021

- SPASDK-69 Rework heroku deploy script [`#44`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/44)
- SPASDK-65 Warn for incompatibility of nomarkup container with vue-sdk [`#43`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/43)
- SPASDK-71 Bumping version to 15.3.3 [`#SPASDK-71`](https://issues.onehippo.com/browse/SPASDK-71)
- SPASDK-69 Rework heroku deploy script [`#SPASDK-69`](https://issues.onehippo.com/browse/SPASDK-69)
- SPASDK-65 Warn for incompatibility of nomarkup container with vue-sdk [`#SPASDK-65`](https://issues.onehippo.com/browse/SPASDK-65)
- TRIVIAL Add force flag to remove all folders inside docs folder [`6f0f3bd`](https://github.com/bloomreach/spa-sdk/commit/6f0f3bd625ab21440fd56b0ffc443404e17e6f65)

#### [spa-sdk-15.3.2](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.3.1...spa-sdk-15.3.2)

> 19 October 2021

- SPASDK-62 Retrieve segmentation cookies from request object in case SSR [`#41`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/41)
- SPASDK-63 Allow attribute "rel" in sanitize [`#42`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/42)
- SPASDK-49 Add `s` flag to regular expression to match body content [`#38`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/38)
- SPASDK-64 Bumping version to 15.3.2 [`#SPASDK-64`](https://issues.onehippo.com/browse/SPASDK-64)
- SPASDK-62 Retrieve segmentation cookies from request object in case SSR [`#SPASDK-62`](https://issues.onehippo.com/browse/SPASDK-62)
- SPASDK-63 Allow attribute "rel" in sanitize [`#SPASDK-63`](https://issues.onehippo.com/browse/SPASDK-63)
- SPASDK-49 Add `s` flag to regular expression to match body content [`#SPASDK-49`](https://issues.onehippo.com/browse/SPASDK-49)
- TRIVIAL Fix release script part related to the publishing TypyDoc [`8faca44`](https://github.com/bloomreach/spa-sdk/commit/8faca440aed3751041e8f80d070366189072d2de)

#### [spa-sdk-15.3.1](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.3.0...spa-sdk-15.3.1)

> 8 October 2021

- SPASDK-61 Provide options to html sanitizer to allow some attributes for anchor [`#40`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/40)
- SPASDK-61 Bumping versions to 15.3.1 [`#SPASDK-61`](https://issues.onehippo.com/browse/SPASDK-61)
- SPASDK-61 Provide options to html sanitizer to allow some attributes for anchor [`#SPASDK-61`](https://issues.onehippo.com/browse/SPASDK-61)
- SPASDK-60 Improve README explanation of release process [`#SPASDK-60`](https://issues.onehippo.com/browse/SPASDK-60)
- SPASDK-60 Use correct path to app in heroku deploy [`#SPASDK-60`](https://issues.onehippo.com/browse/SPASDK-60)
- SPASDK-60 Additional fixes to the release script [`#SPASDK-60`](https://issues.onehippo.com/browse/SPASDK-60)
- SPASDK-60 Add heroku as dev dep to enforce version and all build packs are installed [`#SPASDK-60`](https://issues.onehippo.com/browse/SPASDK-60)

#### [spa-sdk-15.3.0](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.2.2-0...spa-sdk-15.3.0)

> 6 October 2021

- SPASDK-59 Bumping versions to 15.3.0 [`#SPASDK-59`](https://issues.onehippo.com/browse/SPASDK-59)
- SPASDK-58 Remove release pipeline and use release script [`#SPASDK-58`](https://issues.onehippo.com/browse/SPASDK-58)
- SPASDK-38 Add page api to sanitize html content in SPA SDK [`#SPASDK-38`](https://issues.onehippo.com/browse/SPASDK-38)

#### [spa-sdk-15.2.2-0](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.2.1...spa-sdk-15.2.2-0)

> 30 September 2021

- SPASDK-58 Merge branch 'development' [`#SPASDK-58`](https://issues.onehippo.com/browse/SPASDK-58)
- SPASDK-58 Bump versions to 15.2.2-0 [`#SPASDK-58`](https://issues.onehippo.com/browse/SPASDK-58)
- SPASDK-58 Update push to github script in Jenkins [`#SPASDK-58`](https://issues.onehippo.com/browse/SPASDK-58)

#### [spa-sdk-15.2.1](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.1.2...spa-sdk-15.2.1)

> 30 September 2021

- SPASDK-53 Handle segmentation; Change campaign variant parameter; [`#31`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/31)
- SPASDK-53 Merge branch 'development' into 'main' [`#SPASDK-53`](https://issues.onehippo.com/browse/SPASDK-53)
- SPASDK-58 Adjust README according to release process [`#SPASDK-58`](https://issues.onehippo.com/browse/SPASDK-58)
- SPASDK-58 Adjust jenkins file so github push works [`#SPASDK-58`](https://issues.onehippo.com/browse/SPASDK-58)
- SPASDK-53 Bump versions to 15.2.1 [`#SPASDK-53`](https://issues.onehippo.com/browse/SPASDK-53)
- SPASDK-53 Handle segmentation; Change campaign variant parameter; [`#SPASDK-53`](https://issues.onehippo.com/browse/SPASDK-53)

#### [spa-sdk-15.1.2](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.1.0...spa-sdk-15.1.2)

> 23 September 2021

- SPASDK-52 Move meta component inside BrNodeComponent [`#32`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/32)
- SPASDK-55 Document "getContainerItemContent' utility fn [`#33`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/33)
- SPASDK-52 Merge branch 'development' into 'main' [`#SPASDK-52`](https://issues.onehippo.com/browse/SPASDK-52)
- SPASDK-52 Bump versions to 15.1.2 [`#SPASDK-52`](https://issues.onehippo.com/browse/SPASDK-52)
- SPASDK-52 Move meta component inside BrNodeComponent [`#SPASDK-52`](https://issues.onehippo.com/browse/SPASDK-52)
- SPASDK-55 Document "getContainerItemContent' utility fn [`#SPASDK-55`](https://issues.onehippo.com/browse/SPASDK-55)
- SPASDK-47 Merge branch 'development' into 'main' [`#SPASDK-47`](https://issues.onehippo.com/browse/SPASDK-47)
- SPASDK-33 Merge branch 'development' into 'main' [`#SPASDK-33`](https://issues.onehippo.com/browse/SPASDK-33)
- SPASDK-33 Merge branch 'development' into 'main' [`#SPASDK-33`](https://issues.onehippo.com/browse/SPASDK-33)
- SPASDK-33 Merge branch 'development' into 'main' [`#SPASDK-33`](https://issues.onehippo.com/browse/SPASDK-33)
- TRIVIAL Update readme table [`e7aacbe`](https://github.com/bloomreach/spa-sdk/commit/e7aacbed48bba8865def26d63e5f218f54cbb5d4)
- TRIVIAL Update development rules about publishing test version to npm [`c40e06f`](https://github.com/bloomreach/spa-sdk/commit/c40e06fd54738ef29eb293d7a3918d415653afe4)
- TRIVIAL Add more information about what should be in `dist-tag` [`4ca2818`](https://github.com/bloomreach/spa-sdk/commit/4ca281831a0235a7a8ac5b70fe339f0f0b04eae8)
- TRIVIAL Update readme table [`0d6b7c2`](https://github.com/bloomreach/spa-sdk/commit/0d6b7c292eae27e5b3ad95a68772421f1470106e)
- TRIVIAL Merge branch 'development' into main [`52412ae`](https://github.com/bloomreach/spa-sdk/commit/52412ae42ab0303cdf514081c3b254fde2cdab3c)
- TRIVIAL Merge branch 'development' into 'main' [`f446241`](https://github.com/bloomreach/spa-sdk/commit/f44624130fea51d553e2f1488ce433a11846f71a)

#### [spa-sdk-15.1.0](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.0.1-0...spa-sdk-15.1.0)

> 23 August 2021

- Resolve SPASDK-13 "Migrate to eslint all spa sdk projects" [`#24`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/24)
- SPASDK-42 Link doesn't get updated when btm_campaign_id is present [`#27`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/27)
- Resolve SPASDK-43 "Bugfix/ sbcp does not work with ssr apps" [`#26`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/26)
- SPASDK-34 Check if window variable is defined(Fix SSR issue) [`#21`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/21)
- SPASDK-47 Bump versions to 15.1.0 [`#SPASDK-47`](https://issues.onehippo.com/browse/SPASDK-47)
- SPASDK-13 [example-next] Fix all lint warnings [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-nuxt] Fix all lint warnings [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-angular] Fix all lint warnings [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [ng-sdk] Fix all lint warnings [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [react-sdk] Fix all lint warnings [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [spa-sdk] Fix all lint warnings [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 Bump eslint configs to the latest version [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 Bump eslint-config-react version [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-46 Bump xmldom to 0.7.2 [`#SPASDK-46`](https://issues.onehippo.com/browse/SPASDK-46)
- SPASDK-46 Bump xmldom to 0.7.1 [`#SPASDK-46`](https://issues.onehippo.com/browse/SPASDK-46)
- SPASDK-13 Update eslint configs to latest version [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 Remove IDE specific settings [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 Bump @bloomreach/eslint-config-* to prerelease version [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-next] Rollback next to the prev version [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 Add .vscode to gitignore but skip config files [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 Move the rest of eslintrc congfigs to the package.json [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 Move all eslint config to package.json except angular projects [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [spa-sdk] Switch on no-shadow and max-len rules for tests [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 Remove some unused dependencies from next and react examples [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [react-sdk] Fix rest of eslint errors manually [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [react-sdk] Explicitly setup enzyme adapter react [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-angular] Fix rest of eslint errors manually [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-angular] Replace tslint with @bloomreach/eslint-config-angular [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-nuxt] Fix eslint errors manually [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-nuxt] Use @bloomreach/eslint-config-nuxt [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-next] Fix rest of eslint errors manually [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-next] Bump next.js to 11 and set up eslint [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-react] Fix rest of eslint errors manually [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-react] Use @bloomreach/eslint-config [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [example-vue] Use @bloomreach/eslint-config [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [vue-sdk] Use @bloomreach/eslint-config [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [ng-sdk] Fix rest of eslint errors manually [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [ng-sdk] Replace tslint with @bloomreach/eslint-config [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [spa-sdk] Fix rest of eslint errors manually [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [spa-sdk] Replace tslint with eslint [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-13 [react-sdk] Replace tslint with eslint [`#SPASDK-13`](https://issues.onehippo.com/browse/SPASDK-13)
- SPASDK-42 Fix wrong campaign parameter name [`#SPASDK-42`](https://issues.onehippo.com/browse/SPASDK-42)
- SPASDK-42 Add missing license [`#SPASDK-42`](https://issues.onehippo.com/browse/SPASDK-42)
- SPASDK-42 Extend unit tests [`#SPASDK-42`](https://issues.onehippo.com/browse/SPASDK-42)
- SPASDK-42 Refactor folder structure [`#SPASDK-42`](https://issues.onehippo.com/browse/SPASDK-42)
- SPASDK-42 Refactor getCampaignVariantId method into its own class [`#SPASDK-42`](https://issues.onehippo.com/browse/SPASDK-42)
- SPASDK-42 Check if DOM is ready [`#SPASDK-42`](https://issues.onehippo.com/browse/SPASDK-42)
- SPASDK-42 Change TTL from milliseconds to days, default to 7 days with a maximun of 28 days [`#SPASDK-42`](https://issues.onehippo.com/browse/SPASDK-42)
- SPASDK-42 Change campaign parameter, fix TTL implementation and some code refactoring [`#SPASDK-42`](https://issues.onehippo.com/browse/SPASDK-42)
- SPASDK-43 Add test cases with request object [`#SPASDK-43`](https://issues.onehippo.com/browse/SPASDK-43)
- SPASDK-43 Provide request object to get campaign variant id method [`#SPASDK-43`](https://issues.onehippo.com/browse/SPASDK-43)
- SPASDK-43 Add new method to get cookies from the request object [`#SPASDK-43`](https://issues.onehippo.com/browse/SPASDK-43)
- SPASDK-34 Check if window variable is defined(Fix SSR issue) [`#SPASDK-34`](https://issues.onehippo.com/browse/SPASDK-34)
- Revert "SPASDK-22 Update xmldom to the latest version to fix security issue" [`abc3314`](https://github.com/bloomreach/spa-sdk/commit/abc33141c2579341a12a02f5b9b148d6c5ae7aa8)
- TRIVIAL Add jenkins status to gitlab MRs [`4da0713`](https://github.com/bloomreach/spa-sdk/commit/4da07135f78485d4577c24b1320d22453028f3e0)
- TRIVIAL Update readme table [`c4d00b2`](https://github.com/bloomreach/spa-sdk/commit/c4d00b2301485695717483d517ee299fd93998b9)

#### [spa-sdk-15.0.1-0](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.0.0...spa-sdk-15.0.1-0)

> 9 August 2021

- SPASDK-22 Update xmldom to the latest version to fix security issue [`#18`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/18)
- SPASDK-34 Make the SPA Personalization aware [`#14`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/14)
- SPASDK-33 Bump versions to 15.0.1-0 [`#SPASDK-33`](https://issues.onehippo.com/browse/SPASDK-33)
- SPASDK-34 Make the SPA Personalization aware [`#SPASDK-34`](https://issues.onehippo.com/browse/SPASDK-34)
- SPASDK-33 Update git command to publish to github [`#SPASDK-33`](https://issues.onehippo.com/browse/SPASDK-33)
- SPASDK-22 Update xmldom to the latest version to fix security issue [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)

#### [spa-sdk-15.0.0](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-15.0.0-1...spa-sdk-15.0.0)

> 9 August 2021

- SPASDK-32 Auto generate a changelog and setup release notes process [`#15`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/15)
- Resolve SPASDK-22 "Update and lock spa sdk dependencies" [`#10`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/10)
- SPASDK-33 Bump versions to SPASDK-33 [`#SPASDK-33`](https://issues.onehippo.com/browse/SPASDK-33)
- SPASDK-33 Remove 'main' branch specification [`#SPASDK-33`](https://issues.onehippo.com/browse/SPASDK-33)
- SPASDK-32 Bump versions to 15.0.0-2 [`#SPASDK-32`](https://issues.onehippo.com/browse/SPASDK-32)
- SPASDK-32 Add version to workspace so auto-changelog can detect it [`#SPASDK-32`](https://issues.onehippo.com/browse/SPASDK-32)
- SPASDK-22 Set explicit version for node types in next example [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Return back initila version befor changes [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Return back range for angular in ng-sdk peer dependencies [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Retunr back `nuxt/recomended` setting removed by mistake [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Run prettier on vue-sdk [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Bump and pin dependencies in nuxt example project [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Update vue-sdk version in vue/nuxt example projects [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Bump vue-sdk version and publish [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Rollback `vue-fragment` to 1.5.1 [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Change SDK's versions in example projects [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Bump SDK's versions and publish [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Bump and pin dependencies in vue example project [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Adjust TS to the new version 4.1 [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Bump and pin dependincies in next example project [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Adjust TS to the new version 4.1 [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Bump and pin dependencies in react example project [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Bump and pin dependencies in angular example project [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Bump and pin dependencies in vue-sdk package [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Bump and pin dependencies in ng-sdk package [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Bump and pin dependencies in react-sdk package [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Bump and pin dev dependencies in the spa-sdk package [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Install yarn plugin for interactive upgrade [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Update local yarn to the latest version [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-22 Update dependencies in spa-sdk [`#SPASDK-22`](https://issues.onehippo.com/browse/SPASDK-22)
- SPASDK-32 Use auto-changelog to generate CHANGELOG.md [`#SPASDK-32`](https://issues.onehippo.com/browse/SPASDK-32)

#### [spa-sdk-15.0.0-1](https://github.com/bloomreach/spa-sdk/compare/spa-sdk-0.3.0-saas...spa-sdk-15.0.0-1)

> 5 August 2021

- SPASDK-31 Generate and host Typescript docs for SDKs [`#13`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/13)
- SPASDK-25 Set up spa sdk pipelines [`#9`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/9)
- SPASDK-18 Improve documentation (READMEs) in SPA SDKs and Example apps [`#11`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/11)
- SPASDK-18 Improve documentation (READMEs) in SPA SDKs and Example apps [`#8`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/8)
- SPASDK-29 Fix container can't be interacted [`#5`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/5)
- SPASDK-8 Bump version to 0.3.2-saas [`#6`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/6)
- SPASDK-7 Add HandleHttpError [`#3`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/3)
- SPASDK-2 Add exported function "getContainerItemContent" [`#1`](https://code.bloomreach.com/engineering/xm/spa-sdk/-/merge_requests/1)
- SPASDK-32 Bump versions to 15.0.0-1 [`#SPASDK-32`](https://issues.onehippo.com/browse/SPASDK-32)
- SPASDK-31 Include non exported interfaces as it gives complete documentation [`#SPASDK-31`](https://issues.onehippo.com/browse/SPASDK-31)
- SPASDK-31 Add pipeline for publishing SPA SDK TypeDocs [`#SPASDK-31`](https://issues.onehippo.com/browse/SPASDK-31)
- SPASDK-31 indicate version in typedoc [`#SPASDK-31`](https://issues.onehippo.com/browse/SPASDK-31)
- SPASDK-31 Fix table in README.md [`#SPASDK-31`](https://issues.onehippo.com/browse/SPASDK-31)
- SPASDK-25 Remove heroku prefix [`#SPASDK-25`](https://issues.onehippo.com/browse/SPASDK-25)
- SPASDK-25 Update package files with correct links [`#SPASDK-25`](https://issues.onehippo.com/browse/SPASDK-25)
- SPASDK-25 For Heroku, replace dots with dashes [`#SPASDK-25`](https://issues.onehippo.com/browse/SPASDK-25)
- SPASDK-25 Do changes after verification [`#SPASDK-25`](https://issues.onehippo.com/browse/SPASDK-25)
- SPASDK-25 Add heroku deploy pipeline [`#SPASDK-25`](https://issues.onehippo.com/browse/SPASDK-25)
- SPASDK-25 Publish to github on tag [`#SPASDK-25`](https://issues.onehippo.com/browse/SPASDK-25)
- SPASDK-18 Reflect current release process instead of ideal one [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-18 Improved table of initialize config documentation [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-18 Consistent naming of PMA in READMEs [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-18 Add recommendation of styling for buttons [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-18 Remove link as there will be multiple release notes [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-18 Explicitly mention path should include query parameters [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-18 Use yarn instead of npm in nuxt example [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-18 Fix run command in react example [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-18 Update README.md files of example apps [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-18 Update package README's [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-18 No longer work with special saas versions [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-18 Update root README [`#SPASDK-18`](https://issues.onehippo.com/browse/SPASDK-18)
- SPASDK-8 Bump version to 0.3.2-saas [`#SPASDK-8`](https://issues.onehippo.com/browse/SPASDK-8)
- SPASDK-29 Fix unit test [`#SPASDK-29`](https://issues.onehippo.com/browse/SPASDK-29)
- SPASDK-29 Fix unit tests [`#SPASDK-29`](https://issues.onehippo.com/browse/SPASDK-29)
- SPASDK-29 Fix container can't be interacted when a container-item is not mapped in SPA and "nomarkup" is used for the parent container [`#SPASDK-29`](https://issues.onehippo.com/browse/SPASDK-29)
- SPASDK-7 Add HandleHttpError [`#SPASDK-7`](https://issues.onehippo.com/browse/SPASDK-7)
- SPASDK-6 Set versions to 0.3.1-saas [`#SPASDK-6`](https://issues.onehippo.com/browse/SPASDK-6)
- SPASDK-6 Lock vue-fragment version to 1.5.1 [`#SPASDK-6`](https://issues.onehippo.com/browse/SPASDK-6)
- SPASDK-2 Update snapshots for tests [`#SPASDK-2`](https://issues.onehippo.com/browse/SPASDK-2)
- SPASDK-2 Revert accidentally commited change [`#SPASDK-2`](https://issues.onehippo.com/browse/SPASDK-2)
- SPASDK-2 Update test snapshots to fix failing tests [`#SPASDK-2`](https://issues.onehippo.com/browse/SPASDK-2)
- SPASDK-2 Log warning for unsupported method "getContentReference" in v0.9 [`#SPASDK-2`](https://issues.onehippo.com/browse/SPASDK-2)
- SPASDK-2 Add exported function "getContainerItemContent" [`#SPASDK-2`](https://issues.onehippo.com/browse/SPASDK-2)
- SPASDK-1 Bump to use node 14 [`#SPASDK-1`](https://issues.onehippo.com/browse/SPASDK-1)
- TRIVIAL Set branch name to 'main' in changesetBaseRefs [`4dacdcd`](https://github.com/bloomreach/spa-sdk/commit/4dacdcd2fdb0712e40dcb33b9809ae12786f9ab1)
- TRIVIAL Skip telemetry check on nuxt startup [`15deb25`](https://github.com/bloomreach/spa-sdk/commit/15deb25b1edde3af3296d4dc34dba1483fe278f2)
