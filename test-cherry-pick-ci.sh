# ------------------------
# main
# ------------------------
echo "MAIN"
echo "------------------------"

git checkout orgtoar-main

if [[ $2 == 'breaking' ]]; then
  git cherry-pick orgtoar-main-breaking
elif [[ $1 == 'pr' ]]; then
  git apply main.patch
  git commit --all -m "make change not in release"
fi

git push -v --force orgtoar orgtoar-main\:refs/heads/main

# ------------------------
# NEXT
# ------------------------
echo
echo "NEXT"
echo "------------------------"

git checkout orgtoar-next
git reset --hard main --
git rebase --autostash orgtoar-main

if [[ $1 == 'pr' ]]; then
  git reset --hard HEAD^ --
fi

git push -v --force orgtoar orgtoar-next\:refs/heads/next

# ------------------------
# test
# ------------------------
echo
echo "TEST"
echo "------------------------"

git checkout orgtoar-cherry-pick-ci-test
git reset --hard main --
git rebase --autostash orgtoar-main

if [[ $2 == 'breaking' ]]; then
  git cherry-pick orgtoar-cherry-pick-ci-test-breaking
elif [[ $2 == 'docs' ]]; then
  git apply docs.patch
  git commit --all -m "test docs cherry pick ci"
else
  git apply test.patch
  git commit --all -m "test cherry pick ci"
fi

git push -v --force orgtoar orgtoar-cherry-pick-ci-test\:refs/heads/cherry-pick-ci-test

# ------------------------
# cleanup
# ------------------------
echo
echo "RESET"
echo "------------------------"

git checkout orgtoar-main
open https://github.com/orgtoar/redwood-test/compare/next...main
