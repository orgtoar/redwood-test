# ------------------------
# main
# ------------------------
echo "MAIN"
echo "------------------------"

git checkout orgtoar-main
# read -> apply patch?
# set to true...
# git apply orgtoar-main.patch
# git commit --all -m "make change not in release"
# commit
git push -v --force orgtoar orgtoar-main\:refs/heads/main

# ------------------------
# release
# ------------------------
echo "\nRELEASE"
echo "------------------------"

git checkout orgtoar-release
git reset --hard main --
git rebase --autostash orgtoar-main
# if apply patch, reset one commit...
git push -v --force orgtoar orgtoar-release\:refs/heads/release

# ------------------------
# test
# ------------------------
echo "\nTEST"
echo "------------------------"

git checkout orgtoar-cherry-pick-ci-test
git reset --hard main --
git rebase --autostash orgtoar-main
git apply test.patch
git commit --all -m "test cherry pick ci"
git push -v --force orgtoar orgtoar-cherry-pick-ci-test\:refs/heads/orgtoar-cherry-pick-ci-test

# ------------------------
# cleanup
# ------------------------
echo "\nRESET"
echo "------------------------"
git checkout orgtoar-main
open https://github.com/orgtoar/redwood-test/compare/main...release
