globalThis.__dirname = __dirname
import path from 'path'

// Load mocks
import '../../../../lib/test'

import { getDefaultArgs } from '../../../../lib'
import { getYargsDefaults as defaults } from '../../helpers'
import * as scaffold from '../scaffoldHandler'

jest.mock('execa')

describe('relational form field', () => {
  let form

  beforeAll(async () => {
    const files = await scaffold.files({
      ...getDefaultArgs(defaults()),
      model: 'Tag',
      tests: true,
      nestScaffoldByModel: true,
    })

    const tagFormPath =
      '/path/to/project/web/src/components/Tag/TagForm/TagForm.jsx'
    form = files[path.normalize(tagFormPath)]
  })

  test("includes optional relational fields with an emptyAs('undefined')", () => {
    expect(form).toMatch("emptyAs={'undefined'}")
  })
})
