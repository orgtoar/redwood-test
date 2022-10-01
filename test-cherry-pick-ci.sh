# ------------------------
# main
# ------------------------
echo "MAIN"
echo "------------------------"

git checkout orgtoar-main

# git apply orgtoar-main.patch
# git commit --all -m "make change not in release"

git push -v --force orgtoar orgtoar-main\:refs/heads/main

# ------------------------
# release
# ------------------------
echo "\nRELEASE"
echo "------------------------"

git checkout orgtoar-release
git reset --hard main --
git rebase --autostash orgtoar-main

# git reset --hard HEAD^ --

git push -v --force orgtoar orgtoar-release\:refs/heads/release

# ------------------------
# test
# ------------------------
echo "\nTEST"
echo "------------------------"

git checkout orgtoar-cherry-pick-ci-test
git reset --hard main --
git rebase --autostash orgtoar-main

# git apply test.patch
git apply docs.patch
git commit --all -m "test cherry pick ci"

git push -v --force orgtoar orgtoar-cherry-pick-ci-test\:refs/heads/orgtoar-cherry-pick-ci-test

# ------------------------
# cleanup
# ------------------------
echo "\nRESET"
echo "------------------------"

git checkout orgtoar-main
open https://github.com/orgtoar/redwood-test/compare/release...main
