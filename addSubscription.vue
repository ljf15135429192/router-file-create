<template>
  <!-- 添加订阅 -->
  <div class="subscription">
    <Breadcrumb :headerNav="headerNav" />
    <div class="add-subscription">
      <!-- VIP订阅时显示 -->
      <div class="total_detailed flex" v-if="subscribeType == 2">
        <div class="total_info">
          合计金额：<span>{{ total }}</span>
        </div>
        <div
          class="detailed_info flex"
          @click="$refs.costDialog.isCostDialog = true"
        >
          <img src="@/assets/shangji/mingxi.png" alt="" />
          <div>费用清单明细</div>
        </div>
      </div>
      <div class="tips_subscribe flex">
        <!-- VIP订阅时显示 -->
        <template v-if="subscribeType == 2">
          <div class="tips">
            温馨提示：商机订阅后，系统将实时监测平台所有信息，并根据您设定的内容向您推送，助您掌握最新商机动态！
          </div>
          <div class="subscribe_info flex">
            <div class="subscribe_tips">
              您还可以免费订阅 <span>{{ freeCount }}</span> 类商机
            </div>
            <div class="subscribe_btn" @click="handleAdd(1)">免费试用订阅</div>
          </div>
        </template>
        <template v-else>
          <div class="tips">
            温馨提示：目前是“免费试用”模式，您还可以免费订阅 {{ freeCount }}
            类商机，如需订阅更多类型，请点击<span>“申请VIP订阅”</span>订制您的专属商机，助您获取更多商机。
          </div>
          <div class="vip_btn" @click="handleAdd(2)">
            申请 <img src="@/assets/shangji/vip.png" alt="" /> 订阅
          </div>
        </template>
      </div>
      <!-- 表单 -->
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-position="top"
        class="custom-form"
      >
        <!-- VIP订阅时显示 -->
        <el-form-item
          label="订阅期限"
          prop="timeKey"
          class="subscribe_term"
          v-if="subscribeType == 2"
        >
          <el-select
            v-model="ruleForm.timeKey"
            placeholder="请选择"
            @change="timeChange"
          >
            <el-option
              v-for="item in timeOptions"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            >
            </el-option>
          </el-select>
          <el-input-number
            v-model="ruleForm.timeNum"
            @change="handleChange"
            :min="1"
          ></el-input-number>
          <div class="end_time">
            预计截止时间：
            <span>{{ endTime }}</span>
          </div>
        </el-form-item>
        <el-form-item label="订阅期限" prop="" class="subscribe_term" v-else>
          <div class="free_time">
            即日起可免费试用 <span>{{ ruleForm.timeNum }}</span>
            {{ ruleForm.timeName }}，预计截止时间：
            <span>{{ endTime }}</span>
          </div>
        </el-form-item>
        <!-- subtitle="一条订阅仅可添加一个一级类目，可选择此一级类目下多个子级类目" -->
        <el-form-item
          label="请选择商机类型"
          prop="activeCategories"
          class="button-with-tag"
        >
          <el-row class="flex" style="flex-wrap: wrap">
            <!-- <el-button
              class="default-tag-button"
              :class="{ 'default-tag-button-active': true }"
              plain
              icon="el-icon-plus"
              @click="addCategory"
              >添加分类</el-button
            > -->
            <div
              class="item_box"
              :class="{
                'default-tag-button-active':
                  ruleForm.activeCategories.findIndex((i) => {
                    return i.no[0] == item.no;
                  }) !== -1,
              }"
              v-for="(item, index) in categoryList"
              :key="index"
              @click="addCategory(item.no)"
            >
              {{ item.name }}
            </div>
          </el-row>
          <!-- 已选中商机类型 -->
          <el-row class="empty_box" v-if="ruleForm.activeCategories.length">
            <el-tag
              :class="{ el_tag: tag.whetherSubscribe }"
              v-for="(tag, tagIndex) in ruleForm.activeCategories"
              :key="tag.name"
              @close="closeBusinessTags(tagIndex)"
              closable
            >
              {{ tag.name }}
              <el-tooltip
                class="item"
                effect="light"
                content="该商机分类其他订阅已添加过，请知悉！"
                placement="bottom"
              >
                <img
                  v-if="tag.whetherSubscribe"
                  src="@/assets/shangji/tooltip.png"
                  class="tooltip"
                />
              </el-tooltip>
            </el-tag>
          </el-row>
        </el-form-item>
        <el-form-item label="请选择商机来源" prop="types" class="radio-box">
          <el-radio-group v-model="ruleForm.types" size="small">
            <el-radio label="1" border :disabled="typesLength == 0"
              >全部</el-radio
            >
            <el-radio label="2" border>
              <el-checkbox-group v-model="activeTypes">
                <el-checkbox
                  :label="checkbox"
                  v-for="(checkbox, checkIndex) in typesList"
                  :key="checkIndex"
                  :disabled="!checkbox.display"
                  >{{ checkbox.name }}</el-checkbox
                >
              </el-checkbox-group>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="请选择省会/城市"
          prop="activeCities"
          class="button-with-tag"
        >
          <el-row class="flex" style="flex-wrap: wrap">
            <!-- <el-button
              class="default-tag-button"
              icon="el-icon-plus"
              :class="{ 'default-tag-button-active': true }"
              plain
              @click="$refs.cityDialog.dialogVisible = true"
              >添加城市</el-button
            > -->
            <!-- <div
              class="item_box"
              :class="{
                'default-tag-button-active':
                  selectProvinceObj.id === 100000 ||
                  ruleForm.activeCities.findIndex(
                    (cityItem) => cityItem.id == 100000
                  ) !== -1,
              }"
              @click="wholeCountry"
            >
              全国
            </div> -->
            <div
              class="item_box"
              :class="{
                'default-tag-button-active':
                  selectProvinceObj.id === item.id ||
                  ruleForm.activeCities.findIndex(
                    (cityItem) =>
                      cityItem.parentNo == item.id || cityItem.id == item.id
                  ) !== -1,
              }"
              v-for="(item, index) in allArea"
              :key="index"
              @click="cityClick(item)"
            >
              {{ item.name }}
            </div>
          </el-row>
          <el-row class="empty_box" v-if="ruleForm.activeCities.length">
            <el-tag
              v-for="(tag, tagIndex) in ruleForm.activeCities"
              :key="tag.id"
              closable
              @close="delCityTag(tagIndex)"
            >
              {{ tag.name }}
            </el-tag>
          </el-row>
        </el-form-item>
        <el-form-item
          label="请设置商机预算金额"
          prop="amount"
          class="radio-box"
        >
          <el-radio-group v-model="ruleForm.amount" size="small">
            <el-radio label="1" border>不限</el-radio>
            <el-radio label="2" border style="width: 280px; padding: 0">
              <div class="budget">
                <el-input
                  v-model="ruleForm.budgetAmountStart"
                  @focus="ruleForm.amount = '2'"
                  placeholder="最低预算"
                  @keyup.native="regBudge($event, ruleForm.budgetAmountStart)"
                  maxlength="13"
                />
                <span style="user-select: none">-</span>
                <el-input
                  v-model="ruleForm.budgetAmountEnd"
                  @focus="ruleForm.amount = '2'"
                  placeholder="最高预算"
                  @keyup.native="regBudge($event, ruleForm.budgetAmountEnd)"
                  maxlength="13"
                />
                <i
                  class="el-icon-circle-close budget-icon"
                  v-if="
                    ruleForm.budgetAmountStart !== '' ||
                    ruleForm.budgetAmountEnd !== ''
                  "
                  @click="clearBudget"
                />
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="请选择商机接收人"
          class="button-with-tag"
          v-if="$store.state.auth_user.type != 0"
        >
          <el-row class="flex">
            <el-button
              class="default-tag-button"
              icon="el-icon-plus"
              :class="{ 'default-tag-button-active': true }"
              plain
              @click="showOrg = true"
              >添加人员</el-button
            >
            <el-tag
              v-for="(tag, tagIndex) in memberList"
              :key="tag.id"
              closable
              @close="delMemberTags(tagIndex)"
            >
              {{ tag.name }}
            </el-tag>
          </el-row>
        </el-form-item>

        <el-form-item
          label="请选择推送渠道"
          prop="pushChannel"
          class="radio-box"
        >
          <el-radio-group v-model="ruleForm.pushChannel" size="small">
            <el-radio label="all" border @click="allPushChannel">全部</el-radio>
            <el-radio :label="ruleForm.pushChannel" border>
              <el-checkbox-group v-model="ruleForm.pushChannel">
                <el-checkbox label="1" disabled>商机大厅</el-checkbox>
                <el-checkbox label="2">IM消息</el-checkbox>
                <el-checkbox label="3">短信</el-checkbox>
                <el-checkbox label="4">微信公众号</el-checkbox>
              </el-checkbox-group>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="showPushTime"
          label="每天推送时间"
          prop="pushChannel1"
        >
          <el-radio-group v-model="ruleForm.pushChannel1">
            <el-radio label="1">每天1次（9点推送）</el-radio>
            <el-radio label="2">每天2次（9点、12点推送）</el-radio>
            <el-radio label="3"> 每天3次（9点、12点、18点推送）</el-radio>
            <el-radio label="4">每天随时推送</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <!-- <el-row type="flex" justify="center" class="button-row sticky">
        <el-button @click="$router.go(-1)" :disabled="loading">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit(subscribeType)"
          :loading="loading"
          v-if="subscribeType == 2"
          >支付</el-button
        >
        <el-button
          type="primary"
          @click="handleSubmit(subscribeType)"
          :loading="loading"
          v-else
          >保存</el-button
        >
      </el-row> -->
      <!-- 添加商机类型弹窗 -->
      <el-dialog
        title="添加商机类型"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        width="600px"
      >
        <el-form
          ref="categoryForm"
          :model="categoryForm"
          :rules="categoryRules"
          label-width="110px"
        >
          <el-form-item label="一级分类：" prop="first">
            <el-select
              no-data-text="暂无数据"
              v-model="categoryForm.first"
              disabled
              placeholder="请选择商机一级分类"
              @focus="getCategoryOptions('first', 'firstCategories')"
              @change="handleChangeSelect('first')"
            >
              <el-option
                v-for="(item, index) in firstCategories"
                :key="item.no + index"
                :label="item.name"
                :value="item.no"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="二级分类：">
            <el-select
              no-data-text="暂无数据"
              v-model="categoryForm.second"
              placeholder="请选择商机二级分类"
              @focus="getCategoryOptions('second', 'secondCategories')"
              @change="handleChangeSelect('second')"
            >
              <el-option
                v-for="(item, index) in secondCategories"
                :key="item.no + index"
                :label="item.name"
                :disabled="judgeIsActived(item.no)"
                :value="item.no"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="三级分类：">
            <el-select
              no-data-text="暂无数据"
              v-model="categoryForm.third"
              placeholder="请选择商机三级分类"
              @focus="getCategoryOptions('third', 'thirdCategories')"
              @change="handleChangeSelect('third')"
            >
              <el-option
                v-for="(item, index) in thirdCategories"
                :key="item.no + index"
                :label="item.name"
                :disabled="judgeIsActived(item.no)"
                :value="item.no"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="四级分类：">
            <el-select
              multiple
              no-data-text="暂无数据"
              v-model="categoryForm.fourth"
              placeholder="请选择商机四级分类"
              @focus="getCategoryOptions('fourth', 'fourthCategories')"
              @change="handleChangeSelect('fourth')"
            >
              <el-option
                v-for="(item, index) in fourthCategories"
                :key="item.no + index"
                :label="item.name"
                :disabled="judgeIsActived(item.no)"
                :value="item.no"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-row
          type="flex"
          justify="center"
          class="button-row"
          style="margin-top: 18px"
        >
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitCategory"
            >添加</el-button
          >
        </el-row>
      </el-dialog>
      <!-- 添加城市弹窗 -->
      <city-dialog
        ref="cityDialog"
        :fromCity="ruleForm.activeCities"
        :allArea="allArea"
        @addCity="addCity"
        @selectProvince="selectProvince"
      ></city-dialog>
    </div>
    <el-row type="flex" justify="center" class="button-row sticky">
      <el-button @click="$router.go(-1)" :disabled="loading">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit(subscribeType)"
        :loading="loading"
        v-if="subscribeType == 2"
        >支付</el-button
      >
      <el-button
        type="primary"
        @click="handleSubmit(subscribeType)"
        :loading="loading"
        v-else
        >保存</el-button
      >
    </el-row>
    <!-- 费用明细弹窗 -->
    <costDialog
      ref="costDialog"
      :ruleForm="ruleForm"
      :activeCategories="ruleForm.activeCategories"
      :activeTypes="activeTypes"
      :activeCities="ruleForm.activeCities"
      @onTotal="onTotal"
    />
    <!-- 人员选取组织架构弹框 -->
    <el-dialog title="选择" :visible.sync="showOrg" width="700px">
      <selectMember
        class="Org"
        v-model="showOrg"
        @onMemberList="onMemberList"
        :checkedList="memberList"
      ></selectMember>
    </el-dialog>
  </div>
</template>
<script>
import API from "@/api/apiMemberBusiness";
import cityDialog from "@/views/MemberBusiness/components/cityDialog";
import Breadcrumb from "@/views/MemberBusiness/components/breadcrumb.vue";
import selectMember from "@/views/MemberBusiness/components/selectMember.vue";
import moment from "moment";
import merge from "webpack-merge";
export default {
  components: {
    cityDialog,
    Breadcrumb,
    costDialog: () =>
      import("@/views/MemberBusiness/components/costDialog.vue"),
    selectMember,
  },
  data() {
    var typesRule = (rule, value, callback) => {
      if (value == 1 && this.activeTypes.length == 0) {
        callback("请优先选择商机类型");
      } else if (this.activeTypes.length == 0) {
        callback("请选择商机来源");
      } else {
        callback();
      }
    };
    var amountRule = (rule, value, callback) => {
      const start = this.ruleForm.budgetAmountStart;
      const end = this.ruleForm.budgetAmountEnd;
      if (value == 1) {
        callback();
      } else if (value == 2) {
        console.log(start, end);
        if (start !== "" || end !== "") {
          if (
            start !== "" &&
            start <= 9999999999.99 &&
            (start > 0 || start == 0) &&
            end !== "" &&
            end <= 9999999999.99
          ) {
            console.log("走到这里了吗");
            if (
              (start !== "" && end !== "" && Number(end) >= Number(start)) ||
              (start !== "" && (end === "" || end === undefined)) ||
              ((start === "" || start === undefined) && end !== "")
            ) {
              callback();
            } else {
              callback("请输入正确的金额范围");
            }
          } else {
            callback("请输入正确的金额范围");
          }
        } else {
          callback("请输入正确的金额范围");
        }
      }
    };
    let that = this;
    return {
      showPushTime: false,
      total: 0, //总价
      freeCount: 0, // 免费订阅次数
      subscribeType: "", // 订阅类型：1.免费订阅，2.vip订阅
      timeOptions: [], // 时间数组
      categoryList: [], // 商机类型全部
      firstCategories: [], // 一级 分类options
      secondCategories: [], // 二级 分类options
      thirdCategories: [], // 三级 分类options
      fourthCategories: [], // 四级 分类options;
      typesList: [], // 商机来源
      typesLength: 0, // 商机来源可选项的长度
      activeTypes: [], // 已选中商机来源
      memberList: [], // 商机接收人数组
      showOrg: false,
      selectProvinceObj: {},
      moment,
      dialogVisible: false,
      ruleForm: {
        activeCategories: [], // 已选中类型
        activeCities: [], // 已选中城市
        types: "",
        amount: "1",
        timeName: "年", // 年-季度-月-周
        timeNum: 1, // 时间计数
        timeKey: "year", // 时间格式-默认年
        budgetAmountStart: "", // 最低预算
        budgetAmountEnd: "", // 最高预算
        pushChannel: ["1"],
      },
      rules: {
        activeCategories: [
          { required: true, message: "请选择商机类型", trigger: "change" },
        ],
        types: [
          { required: true, message: "请选择商机来源", trigger: "blur" },
          { validator: typesRule, trigger: "blur" },
        ],
        amount: [
          { required: false, message: "请输入预算金额", trigger: "blur" },
          { validator: amountRule, trigger: "blur" },
        ],
        timeKey: [
          { required: true, message: "请选择订阅期限", trigger: "blur" },
        ],
        activeCities: [
          { required: true, message: "请选择省会/城市", trigger: "change" },
        ],
      },
      // 添加分类result
      categoryForm: {
        first: "",
        second: "",
        third: "",
        fourth: "",
      },
      categoryRules: {
        first: [
          { required: true, message: "请选择商机一级分类", trigger: "change" },
        ],
      }, // 添加分类ruls
      allArea: [],
      loading: false,
      mergeCategoriesList: [], // 递归合并子集
      categoriesNoList: [], // 所有分类no集合
      mergeAreaList: [],
      headerNav: [
        // (() => {
        //   let obj = {};
        //   if (that.$route.query.name === "businessHall") {
        //     obj.title = "商机大厅";
        //     obj.router = "/MemberBusiness/businessHall";
        //   } else {
        //     obj.title = "订阅商机";
        //     obj.router = "/subscribeBusiness";
        //   }
        //   return obj;
        // })(),
        {
          title: "订阅管理",
          router: {
            path: "/MemberBusiness/businessSubscription",
            query: { name: this.$route.query.name },
          },
        },
        {
          title: "申请订阅",
          router: that.$route.fullPath,
        },
      ],
    };
  },
  created() {},
  mounted() {
    // 订阅类型：1.免费订阅，2.vip订阅
    const typeCode = this.$route.name.indexOf("Vip") != -1 ? 2 : 1;
    this.subscribeType = this.$route.query.subscribeType || typeCode;
    console.log(this.$route);
    const { subscriptionNo } = this.$route.query;

    if (subscriptionNo) {
      this.getDetail(subscriptionNo);
    }
    this.getFreeCount();
    this.getDateList();
    this.getCategorys();
    this.getSource();
    this.getSysMachineryBasicArea();
  },
  watch: {
    activeTypes: {
      handler: function (val) {
        let arr = this.typesList.filter((item) => {
          return item.display;
        });
        if (val.length != arr.length && val.length > 0)
          this.ruleForm.types = "2";
      },
    },
    "ruleForm.activeCategories": {
      handler: function (val) {
        this.getSource(val);
        this.activeTypes = [];
        this.ruleForm.types = "";
        this.categoriesNoList = [];
        val.forEach((item) => {
          this.categoriesNoList = this.categoriesNoList.concat(...item.no);
        });
        this.categoriesNoList = [...new Set(this.categoriesNoList)];
      },
      deep: true,
    },
    // 类型重置
    "ruleForm.types": {
      // 商机来源全选
      handler: function (val) {
        if (val == "1")
          this.activeTypes = this.typesList.filter((item) => {
            return item.display;
          });
      },
      deep: true,
    },
    // 金额重置
    "ruleForm.amount": {
      handler: function (val) {
        if (val == "1")
          this.ruleForm.budgetAmountStart = this.ruleForm.budgetAmountEnd = "";
      },
      deep: true,
    },
    "ruleForm.pushChannel": {
      handler: function (val) {
        if (!val) return;
        this.ruleForm.pushChannel = val == "all" ? ["1", "2", "3", "4"] : val;
        this.showPushTime = !!this.ruleForm.pushChannel.find((item) => {
          return item === "4";
        });
        console.log(this.ruleForm.pushChannel);
      },
      deep: true,
    },
  },
  computed: {
    // vip订阅期限
    endTime() {
      return moment()
        .add(this.ruleForm.timeNum, this.ruleForm.timeKey)
        .format("YYYY年 MM月 DD日");
    },
  },
  methods: {
    //获取详情
    async getDetail(no) {
      let res = await API.getSubscribeOrderDetail(no);
      if (res.data.code !== 200) return this.$message.error(res.data.msg);
      console.log(res.data.data, "详情");
    },
    // 获取免费订阅次数
    async getFreeCount() {
      let res = await API.getFreeCount();
      if (res.data.code !== 200) return this.$message.error(res.data.msg);
      this.freeCount = res.data.data;
    },
    // 获取日期列表
    async getDateList() {
      let res = await API.getDateList({ subscribeType: this.subscribeType });
      if (res.data.code !== 200) return this.$message.error(res.data.msg);
      //   // console.log("日期列表===>", res.data.data);
      this.timeOptions = res.data.data || [];
      let obj = res.data.data[0] || {};
      this.ruleForm.timeName = obj.name;
      this.ruleForm.timeKey = obj.key;
      this.ruleForm.timeNum = obj.freePeriod;
    },
    // 获取商机类型
    async getCategorys() {
      const { data: res } = await API.getCategorys({
        subscribeType: this.subscribeType,
      });
      this.categoryList = res.data;
      // console.log("商机类型===>", this.categoryList);

      this.recursiveMergeChild(
        this.categoryList,
        "child",
        this.mergeCategoriesList
      );
    },
    // 获取商机来源
    async getSource(val) {
      let arr = [];
      if ((val && val.length == 0) || (val && val.length)) {
        if (val.length) {
          val.forEach((i) => {
            if (!arr.includes(i.no[0])) {
              arr.push(i.no[0]);
            }
          });
        } else {
          arr = [];
        }
      }
      let res = await API.getSource(arr, this.subscribeType);
      if (res.data.code !== 200) return this.$message.error(res.data.msg);
      this.typesList = res.data.data || [];
      this.typesLength = this.typesList.filter((item) => {
        return item.display;
      }).length;
      // console.log("商机来源===>", this.typesList);
    },
    // 获取省会/城市
    async getSysMachineryBasicArea() {
      let res = await API.getSysMachineryBasicArea({
        subscribeType: this.subscribeType,
      });
      if (res.data.code !== 200) return this.$message.error(res.data.msg);
      this.allArea = res.data.data || [];
      // console.log("所有省会/城市===>", this.allArea);
      this.recursiveMergeChild(this.allArea, "children", this.mergeAreaList);
      // 默认选中第一个省份
      this.ruleForm.activeCities.push(this.allArea[0]);
    },
    // 免费/VIP申请订阅切换
    handleAdd(subscribeType) {
      if (subscribeType == 1 && this.freeCount == 0) {
        this.$message.warning("您的免费试用次数已用完。");
        return;
      }
      // 修改路由原有参数
      this.$router.push({
        query: merge(this.$route.query, { subscribeType: subscribeType }),
      });
      this.subscribeType = subscribeType;
      this.getFreeCount();
      this.getDateList();
      this.getCategorys();
      this.getSysMachineryBasicArea();
      this.ruleForm.activeCategories = []; // 清空商机类型
      this.activeTypes = []; // 清空商机来源
      this.ruleForm.activeCities = []; // 清空省会/城市
      this.clearBudget(); // 清空预算金额
      this.memberList = []; // 清空商机接收人
    },
    timeChange(val) {
      let checkItem = this.timeOptions.find((item) => {
        return item.key == val;
      });
      this.ruleForm.timeName = checkItem.name;
    },
    // 计数器change事件
    handleChange(value) {
      this.ruleForm.timeNum = value;
    },
    // 点击全国
    // wholeCountry() {
    //   this.$refs.cityDialog.selectCountry();
    //   this.$refs.cityDialog.submit();
    // },
    // 点击城市
    cityClick(item) {
      this.$refs.cityDialog.dialogVisible = true;
      this.$refs.cityDialog.getCityList(item);
    },
    // 清空预算金额
    clearBudget() {
      this.ruleForm.budgetAmountStart = this.ruleForm.budgetAmountEnd = "";
    },
    regBudge(e, input) {
      e.target.value = e.target.value.replace(/[^\d.]/g, "");
      e.target.value = e.target.value.replace(/\.{2,}/g, ".");
      e.target.value = e.target.value.replace(/^\./g, "0.");
      e.target.value = e.target.value.replace(
        /^\d*\.\d*\./g,
        e.target.value.substring(0, e.target.value.length - 1)
      );
      e.target.value = e.target.value.replace(/^0[^\.]+/g, "0");
      e.target.value = e.target.value.replace(/^(\d+)\.(\d\d).*$/, "$1.$2");

      if (e.target === "") {
        this[input] = "";
        return;
      }
      this[input] = e.target.value;
    },
    // 添加商机类型
    addCategory(no) {
      // 这里调用一下方法让一级菜单显示出来
      this.getCategoryOptions("first", "firstCategories");
      this.dialogVisible = true;
      this.$nextTick(() => {
        const categoryForm = this.$refs["categoryForm"];
        this.categoryForm = {
          first: "",
          second: "",
          third: "",
          fourth: "",
        };
        categoryForm.resetFields();
        this.categoryForm.first = no;
        this.thirdCategories = this.fourthCategories = [];
      });
    },
    // 递归合并分类子集
    recursiveMergeChild(arr, field, result) {
      /**
       * arr     需要递归list
       * field   子集字段名称
       * result  结果存储list
       */
      if (arr) {
        arr.forEach((item) => {
          // push 当前项
          result.push(item);
          if (item[field] && item[field].length > 0) {
            this.recursiveMergeChild(item[field], field, result);
          }
        });
      }
    },
    getCategoryOptions(name, list) {
      if (name === "first") {
        this[list] = this.categoryList;
        return;
      }
      let keys = Object.keys(this.categoryForm);
      let Index = keys.findIndex((key) => {
        return key === name;
      });
      let parentNo = this.categoryForm[keys[Index - 1]];
      let parentlist = this[keys[Index - 1] + "Categories"];
      if (parentNo) this.getChildsCategory(parentlist, parentNo, list);
    },
    getChildsCategory(parentlist, parentNo, current) {
      let parent = parentlist.filter((v) => v.no === parentNo);
      if (parent.length > 0) this[current] = parent[0].child;
    },
    handleChangeSelect(key) {
      let Index = null;
      Object.keys(this.categoryForm).forEach((item, index) => {
        if (item !== key) {
          if (Index !== null && index > Index) {
            this[item + "Categories"] = [];
            this.categoryForm[item] = "";
          }
        } else {
          Index = index;
        }
      });
    },
    // 判断选项是否已存在,存在则禁用
    judgeIsActived(no) {
      return false; // this.categoriesNoList.includes(no);
    },
    handleSubmitCategory() {
      this.$refs["categoryForm"].validate((valid) => {
        if (!valid) return false;
        //  校验无误操作
        let fourth = this.categoryForm.fourth;
        if (fourth !== "" && fourth.length !== 0) {
          fourth.forEach((item, fourIndex) => {
            this.getFourthObj(fourIndex);
          });
        } else {
          this.getFourthObj();
        }
        this.dialogVisible = false;
      });
    },
    getFourthObj(fourIndex) {
      let obj = Object.entries(this.categoryForm);
      // 当前选中商机类型项合集
      let itemList = [];
      let result = {
        name: "",
        no: [],
        bindAllLinkName: "", //订阅数据的链路名称
        bindAllLinkNo: "", //订阅数据的链路编号
        bindCostNo: "", //订阅时，关联的配置费用信息编号
        bindNo: "", //订阅数据的编号
        costDescription: "", // 成本描述
        annualCost: 0, // 年成本
        quarterlyCost: 0, // 季度成本
        monthCost: 0, // 月成本
        weekCost: 0, // 周成本
      };
      obj.forEach((item) => {
        const [key, value] = item;
        if (value && value !== "" && key != "fourth") {
          const arr = this[key + "Categories"];
          let Index = arr.findIndex((v) => {
            return v.no === value;
          });
          itemList.push(arr[Index]);
        }
        if (key == "fourth" && value != "" && value.length != 0) {
          const arr = this[key + "Categories"];
          let Index = arr.findIndex((v) => {
            return v.no === value[fourIndex];
          });
          itemList.push(arr[Index]);
        }
      });
      itemList.forEach((item, index) => {
        result.name += item.name;
        result.no.push(item.no);
        result.bindAllLinkNo += item.no;
        if (itemList.length > 1 && itemList.length != index + 1) {
          result.name += "-";
          result.bindAllLinkNo += ",";
        }
      });
      result.bindAllLinkName = result.name;
      result.bindCostNo = itemList[itemList.length - 1].costNo;
      result.bindNo = itemList[itemList.length - 1].no;
      result.costDescription = itemList[itemList.length - 1].costDescription;
      result.annualCost = itemList[itemList.length - 1].annualCost;
      result.quarterlyCost = itemList[itemList.length - 1].quarterlyCost;
      result.monthCost = itemList[itemList.length - 1].monthCost;
      result.weekCost = itemList[itemList.length - 1].weekCost;
      result.whetherSubscribe = itemList[itemList.length - 1].whetherSubscribe; // 是否订阅过

      if (
        !this.ruleForm.activeCategories.find(
          (item) => item.name === result.name
        )
      ) {
        console.log(result);
        this.ruleForm.activeCategories.push(result);
      }
    },
    // 提交
    handleSubmit(subscribeType) {
      if (subscribeType == 1 && this.freeCount == 0) {
        this.$message.warning(
          "您的免费试用次数已用完，如需订阅更多类型，请点击“申请VIP订阅”获取更多您的专属订阅。"
        );
        return;
      }
      let userType = this.$store.state.auth_user.type;
      this.$refs["ruleForm"].validate(async (valid) => {
        if (!valid) return false;
        //  校验无误操作
        let params = {
          // 预算上限
          budgetUpperLimit:
            this.ruleForm.amount == 1
              ? ""
              : parseFloat(this.ruleForm.budgetAmountEnd),
          // 预算下限
          budgetLowerLimit:
            this.ruleForm.amount == 1
              ? ""
              : parseFloat(this.ruleForm.budgetAmountStart),
          prePayAmount: subscribeType == 2 ? this.total : 0, // 预计支付总金额
          receiveUserNoList: [], //接收人编号
          timeNum: this.ruleForm.timeNum, //订阅时间数量
          timeUnit: this.ruleForm.timeKey, // 订阅时间单位：week、周；month、月；quarter、季度；year、年；
          type: subscribeType, // 订阅类型：1、免费；2、收费；
          categoryDetailList: this.ruleForm.activeCategories, //商机类型-订阅清单
          sourceDetailList: [], // 商机来源-订阅清单
          cityDetailList: [], //	省/市-订阅清单
          pushChannel: this.ruleForm.pushChannel,
        };
        // 处理商机来源
        let arr1 = [];
        this.activeTypes.forEach((item) => {
          arr1.push({
            bindAllLinkName: item.name,
            bindAllLinkNo: item.no,
            bindCostNo: item.costNo,
            bindNo: item.no,
          });
        });
        params.sourceDetailList = arr1;
        // 处理城市
        let arr2 = [];
        this.ruleForm.activeCities.forEach((item) => {
          let obj = {};
          obj.bindAllLinkName = item.bindAllLinkName || item.name;
          obj.bindCostNo = item.costNo;
          obj.bindNo = item.no;
          if (item.parentNo == 0) {
            obj.bindAllLinkNo = item.no;
          } else {
            obj.bindAllLinkNo = item.parentNo + "," + item.no;
          }
          arr2.push(obj);
        });
        params.cityDetailList = arr2;
        // 处理商机接收人
        let arr3 = [];
        this.memberList.forEach((item) => {
          arr3.push(item.memberNo);
        });
        params.receiveUserNoList = arr3;
        console.log("申请订阅传入的数据", params);
        let res = await API.applyMySubscription(params);
        console.log("申请订单接口==>", res);
        this.loading = true;
        if (res.data && res.data.code == 200) {
          this.$message.success("商机订阅成功");
          let subscriptionInfoNo = res.data.data;
          let res2 = await API.addBusiness({ subscriptionInfoNo });
          if (res2.data && res2.data.code == 200) {
            console.log("支付接口==>", res2);
            let orderNo = res2.data.data;
            // 收费订阅
            if (subscribeType == 2) {
              // 如果订单金额为0则不跳转支付页面 直接返回订阅列表
              if (this.total == 0) {
                this.loading = false;
                this.$router.go(-1);
                return;
              }
              // 企业身份
              if (userType == 1) {
                window.open(
                  `${process.env.VUE_APP_PERSONAL_URL}/PendingOrderDetailHuiFu?orderId=${orderNo}&businessOrderId=${orderNo}`
                );
              } else {
                // 个人身份
                window.open(
                  `${process.env.VUE_APP_PERSONAL_URL}/CashierOpen?orderId=${orderNo}&orderType=0018`,
                  "_blank"
                );
              }
            }
            this.loading = false;
            this.$router.go(-1);
          } else {
            this.$message.error(res2.data.msg);
            this.loading = false;
          }
        } else {
          this.$message.error(res.data.msg);
          this.loading = false;
        }
      });
    },
    // 城市选择弹框(确认)回调事件
    addCity(val) {
      this.ruleForm.activeCities = val;
    },
    // 城市选择弹框省份watch回调事件
    selectProvince(val) {
      this.selectProvinceObj = val;
    },
    onMemberList(val) {
      this.memberList = val;
    },
    // 子组件算出的总价
    onTotal(val) {
      this.total = val;
    },
    // 删除城市标签
    delCityTag(index) {
      this.ruleForm.activeCities.splice(index, 1);
    },
    // 删除接收人标签
    delMemberTags(index) {
      this.memberList.splice(index, 1);
    },
    // 删除商机类型标签
    closeBusinessTags(index) {
      this.ruleForm.activeCategories.splice(index, 1);
    },
    // 全选
    allPushChannel() {
      this.ruleForm.pushChannel = ["1", "2", "3"];
    },
  },
};
</script>
<style lang="scss">
// 商机类型tag_提示语样式
.el-tooltip__popper {
  padding: 8px !important;
  // color: #666666 !important;
  border: 1px solid #f5f5f5 !important;
  .popper__arrow {
    display: none !important;
  }
}
</style>
<style lang="scss" scoped>
// @import "../styles/index.scss";
.el_tag {
  position: relative;
  padding-right: 30px !important;
  .tooltip {
    position: absolute;
    width: 16px;
    height: 16px;
    top: 9px;
    right: 5px;
  }
}
.Org {
  height: 530px;

  ::v-deep .el-dialog__header {
    display: none;
  }
}
.empty_box {
  padding: 12px 14px 0 14px;
  min-width: 1200px;
  min-height: 62px;
  border-radius: 2px;
  border: 1px dashed #e4e7ed;
}
.flex {
  display: flex;
}
.add-subscription {
  padding: 0px 20px 20px 20px;
  box-sizing: border-box;
  min-height: 900px;
  position: relative;
  .total_detailed {
    margin-bottom: 20px;
    justify-content: space-between;
    font-size: 14px;
    padding: 0 20px 0 24px;
    min-width: 1200px;
    height: 54px;
    line-height: 54px;
    background: #ffffff;
    box-shadow: 0px 0px 6px 0px rgba(132, 132, 132, 0.3);
    border-radius: 4px;
    .total_info {
      color: #969696;
      span {
        font-size: 20px;
        font-weight: 700;
        color: #ff6600;
      }
    }
    .detailed_info {
      cursor: pointer;
      color: #666666;
      img {
        margin-top: 15px;
        margin-right: 8px;
        width: 24px;
        height: 24px;
      }
    }
  }
  .tips_subscribe {
    justify-content: space-between;
    line-height: 34px;
    margin-bottom: 20px;
    font-size: 14px;
    .tips {
      font-size: 12px;
      color: #ff6600;
      span {
        font-weight: 700;
      }
    }
    .subscribe_info {
      .subscribe_tips {
        color: #333333;
        span {
          color: #ff6600;
          font-weight: 700;
        }
      }
      .subscribe_btn {
        cursor: pointer;
        margin-left: 10px;
        width: 114px;
        height: 34px;
        line-height: 34px;
        text-align: center;
        color: #ffffff;
        background: #0286df;
        border-radius: 4px;
      }
    }
    .vip_btn {
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 108px;
      height: 34px;
      font-size: 14px;
      line-height: 34px;
      color: #ffffff;
      background: linear-gradient(
        135deg,
        #dcc48e 0%,
        #c7a366 50%,
        #b79255 100%
      );
      border-radius: 4px;
      img {
        margin: 0 4px;
        width: 24px;
        height: 14px;
      }
    }
  }
  .previous {
    position: absolute;
    cursor: pointer;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    color: #409eff;
    right: 10px;
  }
  .item_box {
    cursor: pointer;
    margin: 0 12px 12px 0;
    padding: 0 15px;
    min-width: 86px;
    height: 34px;
    line-height: 34px;
    text-align: center;
    border-radius: 4px;
    color: #666666;
    border: 1px solid #e4e7ed;
  }
  .default-tag-button {
    width: 98px;
    height: 34px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-color: #e4e7ed;
    margin-right: 10px;
  }
  .default-tag-button-active {
    border-color: #0286df !important;
    color: #0286df;
  }
  /deep/ .custom-form {
    .el-form-item {
      position: relative;
      margin-bottom: 30px;
      &::after {
        content: attr(subtitle);
        position: absolute;
        left: 88px;
        top: 4px;
        font-size: 12px;
        color: #969696;
      }
      .el-form-item__content {
        margin-top: 14px;
        // display: flex;
        flex-wrap: wrap;
        align-items: center;
      }
    }
    .el-form-item__label {
      line-height: 0;
      padding: 0;
      font-size: 16px;
      color: #333;
    }
    .subscribe_term {
      .el-form-item__content {
        display: flex;
      }
      .el-select {
        width: 100px;
        height: 34px;
        .el-input {
          line-height: 34px;
        }
        .el-input__inner {
          height: 34px;
          line-height: 34px;
        }
        .el-input__icon {
          line-height: 34px;
        }
      }
      .el-input-number {
        margin: 0 20px 0 15px;
        width: 150px;
        .el-input {
          line-height: 34px;
        }
        .el-input-number__decrease,
        .el-input-number__increase {
          background: #ffffff;
          height: 32px;
        }
        .el-input__inner {
          height: 34px;
          line-height: 34px;
        }
      }
      .end_time {
        padding: 0 20px;
        min-width: 238px;
        height: 34px;
        line-height: 34px;
        color: #666666;
        background: #ffffff;
        border-radius: 4px;
        border: 1px solid #e4e7ed;
        span {
          font-weight: 700;
        }
      }
      .free_time {
        color: #666666;
        span {
          color: #333333;
          font-weight: 700;
        }
      }
    }
  }
  .custom-checkbox-grop {
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    padding: 0 10px;
    box-sizing: border-box;
    height: 40px;
  }
  // 预算金额
  .budget {
    display: flex;
    width: 280px;
    height: 31px;
    // border: 1px solid #E4E7ED;
    border-radius: 4px;
    position: relative;
    padding: 0 15px;
    box-sizing: border-box;
    .el-input {
      padding-left: 8px;
      box-sizing: border-box;
    }
    .el-input::after {
      content: "￥";
      font-size: 14px;
      font-family: Microsoft YaHei;
      font-weight: 400;
      color: #333333;
      line-height: 48px;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
    /deep/.el-input__inner {
      height: 31px;
      line-height: 34px;
      border: none !important;
      border-color: transparent !important;
      padding-right: 8px;
    }
    span {
      margin: 0 28px 0 13px;
      width: auto;
      line-height: 34px;
    }
    &-reg {
      position: absolute;
      left: 0;
      bottom: -30px;
      margin: 0 !important;
      color: #f56c6c;
    }
    &-icon {
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
      color: #c0c4cc;
      cursor: pointer;
      font-size: 14px;
      display: none;
    }
  }
  .budget:hover .budget-icon {
    display: inline-block;
  }
  /deep/ .el-dialog {
    .el-form {
      display: flex;
      flex-direction: column;
      align-items: center;
      &-item__content {
        display: flex;
      }
      .el-select {
        width: 300px;
        border-radius: 4px;
      }
    }
  }
  .el-tag:not(:last-child) {
    margin-right: 10px;
  }
  .radio-box {
    /deep/ .el-radio-group {
      display: flex;
      align-items: center;
      .el-radio {
        padding: 0px 20px;
        height: 34px;
        margin-right: 20px;
        margin-left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        .el-radio__input {
          display: none;
        }
        .el-radio__label {
          font-size: 14px;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
      .el-radio.is-bordered.is-checked {
        border-color: #0286df;
      }
    }
  }

  /deep/.el-form-item__error {
    padding-top: 10px;
  }
  .button-with-tag {
    margin-bottom: 50px;
    .el-button,
    .el-tag {
      margin-bottom: 12px;
      height: 34px;
      line-height: 34px;
    }
  }
}
// 选择城市样式
/deep/ .dialogCity {
  .el-dialog {
    .el-dialog__body {
      padding: 0;
    }
  }
}
.cityChoose {
  display: flex;
  .cityChoose_left {
    width: 129px;
    border-right: 1px solid #cecece;
    padding: 10px 10px;
    height: 380px;
    overflow: auto;
    line-height: 40px;
    text-align: center;
    .cityChoose_province {
      cursor: pointer;
    }
    .active {
      color: #409eff;
    }
  }
  .cityChoose_right {
    flex: 1;
    .cityChoose_main {
      height: 300px;
      padding: 20px;
      overflow: auto;
      .el-button {
        width: 90px; // 保证最多五个字
        margin: 0;
        margin-right: 10px;
        margin-bottom: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .cityChoose_buttom {
      border-top: 1px solid #cecece;
      height: 40px;
      line-height: 40px;
      padding: 10px 20px;
      text-align: right;
      .cityChoose_buttom_num {
        float: left;
      }
    }
  }
}

.button-row {
  .el-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 34px;
    line-height: 9px;
    margin: 0;
    &:first-child {
      margin-right: 20px;
    }
  }
}
.sticky {
  position: sticky;
  bottom: 0px;
  background: white;
  height: 60px;
  padding-top: 12px;
  border-top: 1px solid rgb(242, 242, 242);
}
</style>
